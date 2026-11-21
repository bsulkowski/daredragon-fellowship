// Effects of the dragon's actions (rules 2.2) and of the guards that react to
// its attacks (rules 2.1: Intervention Dodge, Shield). Readings of the rules
// that are not spelled out in the text are marked #38 (see AMBIGUITIES.md).

import { BODY_PARTS, type BodyPart, type DragonAction, heroAction } from './actions.ts';
import type { Card } from './cards.ts';
import {
  type Context, type Step,
  cancelActionsOf, discardCards, discardFromHand, emit, enforceHandLimit, setTarget,
} from './core.ts';
import { discard } from './deck.ts';
import { modify } from './dracometer.ts';
import { type GameState, type GuardPending, MAX_HP, isIncapacitated, seatOf } from './state.ts';

/** Ϟ steps of one Shield (2.1). */
export const SHIELD_STEPS = -3;

/**
 * Warm-up of the dragon's action in dragon turns, fixed when the card is
 * placed: +1 if the body part is entangled (2.1 Entangle), +1 if it is at 0 HP
 * (2.3). The 0 HP penalty is applied at placement, as in the sample gameplay
 * (Turn 108❖), although 2.3 evaluates HP penalties at resolution (#38).
 */
export function dragonWarmup(state: GameState, action: DragonAction): number {
  if (action.part === null) return action.warmup;
  const part = state.parts[action.part];
  return action.warmup + (part.entangled ? 1 : 0) + (part.hp === 0 ? 1 : 0);
}

/** Effect of the dragon's action when its warm-up expires. Returns extra cool-down turns. */
export function* resolveDragonAction(ctx: Context, _card: Card, action: DragonAction): Step<number> {
  switch (action.type) {
    case 'direct':
      return yield* directAttack(ctx, action);
    case 'aoe':
      yield* aoeAttack(ctx, action);
      return 0;
    case 'special':
      if (action.name === 'Roar') yield* roar(ctx);
      else if (action.name === 'Health Regeneration') regenerate(ctx, action.heal!);
      else throw new Error(`${action.name} does not warm up`);
      return 0;
  }
}

/** Effect of a card with warm-up and cool-down 0: Glare and Far Glare. */
export function resolveDragonInstant(ctx: Context, _card: Card, action: DragonAction): void {
  if (action.glare === null) throw new Error(`${action.name} is not instant`);
  glare(ctx, action.glare.direction === 'right' ? 1 : -1, action.glare.steps);
}

// ---------------------------------------------------------------------------
// Attacks

/**
 * Ϟ steps common to every daredevil hit by an attack, evaluated at resolution:
 * more than 4 players (2.2), the difficulty modifier (3.1), the HP of the body
 * part (2.3). All modifiers are summed and the sum is applied once, clamped to
 * the ends of the dracometer (#38).
 */
function attackSteps(state: GameState, action: DragonAction): number {
  let steps = state.config.dragonModifier;
  if (state.config.players > 4) steps += 1;
  if (action.part !== null) {
    const hp = state.parts[action.part].hp;
    if (hp === 0) steps -= 2;
    else if (hp <= 13) steps -= 1;
  }
  return steps;
}

/**
 * Direct Attack (2.2) with its guards (2.1).
 *
 * - Intervention Dodge: the target is knocked down instead of being hit, and
 *   the dragon loses its balance. A Dodge cannot save its own player or a
 *   target on the ground; such a Dodge keeps waiting (author, #38).
 * - Guards competing for one attack: the one played last wins (author, #38).
 *   A Dodge played after every Shield acts and the Shields keep waiting;
 *   otherwise the Shields act and the Dodges keep waiting.
 * - Shield: all Shields of other players act; −3Ϟ each; the last shielder takes
 *   the damage and the attack's inherent knockdown. The warm-up and on-ground
 *   bonuses come from the target's state; the Shield only prevents the warm-up
 *   knockdown (author, #38).
 */
function* directAttack(ctx: Context, action: DragonAction): Step<number> {
  const { state } = ctx;
  const target = state.target;
  // The target can only be lost to the dragon's own attacks, never while one warms up.
  if (target === null) throw new Error(`${action.name} resolves without a target`);
  clearEntanglement(state, action);

  const prone = state.heroes[target].prone;
  const warmingUp = state.pending.some((p) => p.actor === target);

  const dodge = prone ? undefined : guards(state, 'Intervention Dodge').filter((g) => g.actor !== target).at(-1);
  const shields = guards(state, 'Shield').filter((g) => g.actor !== target);
  if (dodge && (shields.length === 0 || dodge.placed > shields[shields.length - 1].placed)) {
    useGuard(ctx, dodge);
    knockDown(ctx, target);
    openRiposte(ctx, action, 2);
    return 1; // the dragon loses its balance: cool-down +1
  }

  let steps = attackSteps(state, action) + (warmingUp ? 1 : 0) + (prone ? 2 : 0);
  let victim = target;
  let knockdown = action.knockdown || warmingUp;
  if (shields.length > 0) {
    for (const shield of shields) useGuard(ctx, shield);
    steps += SHIELD_STEPS * shields.length;
    victim = shields[shields.length - 1].actor;
    knockdown = action.knockdown;
  }
  yield* hit(ctx, victim, modify(action.damage!, steps), knockdown);
  openRiposte(ctx, action, 1);
  return 0;
}

/**
 * AoE Attack (2.2): the target and both its seat neighbours — incapacitated
 * neighbours included, as in the sample gameplay (Turn 104❖) — except those on
 * the ground (#38).
 *
 * - Intervention Dodge saves the target as in a direct attack, without loss of
 *   balance (2.1); with several, the one played last (author, #38). Dodge and
 *   Shields do not compete here: the Dodge covers the target, the Shields the
 *   others (#38).
 * - Every Shield acts, provided someone in the area is to be hit (#38): −3Ϟ
 *   for everyone in the area except the shielder; a shielder outside the area
 *   enters it, shielded by all Shields (2.1 example: A 1, B 1, C 4, D 1).
 */
function* aoeAttack(ctx: Context, action: DragonAction): Step {
  const { state } = ctx;
  const target = state.target;
  if (target === null) throw new Error(`${action.name} resolves without a target`);
  clearEntanglement(state, action);

  const n = state.config.players;
  const area = [(target + n - 1) % n, target, (target + 1) % n];
  const standing = (seat: number) => !state.heroes[seat].prone;

  const dodge = standing(target) ? guards(state, 'Intervention Dodge').filter((g) => g.actor !== target).at(-1) : undefined;
  const hitInArea = area.filter((seat) => standing(seat) && !(dodge && seat === target));
  const shields = hitInArea.length > 0 ? guards(state, 'Shield') : [];
  const entering = shields.map((g) => g.actor).filter((seat) => !area.includes(seat) && standing(seat));

  // Shields act together with the Dodge, before its knockdown could cancel a
  // Shield of the target's own.
  for (const shield of shields) useGuard(ctx, shield);
  if (dodge) {
    useGuard(ctx, dodge);
    knockDown(ctx, target);
  }

  const steps = attackSteps(state, action);
  for (const seat of [...hitInArea, ...entering]) {
    const inArea = area.includes(seat);
    const shielding = shields.filter((g) => g.actor !== seat || !inArea).length;
    yield* hit(ctx, seat, modify(action.damage!, steps + SHIELD_STEPS * shielding), action.knockdown);
  }
  openRiposte(ctx, action, 1);
}

/** "The entanglement token is removed only when the attack resolves" (2.1 Entangle). */
function clearEntanglement(state: GameState, action: DragonAction): void {
  if (action.part !== null) state.parts[action.part].entangled = false;
}

/** Attacks on the body part get +2Ϟ in the next `turns` daredevil turns (2.1 Attack, Intervention Dodge). */
function openRiposte(ctx: Context, action: DragonAction, turns: 1 | 2): void {
  if (action.part === null) return;
  const riposte = { part: action.part, from: ctx.state.turn + 1, to: ctx.state.turn + turns };
  ctx.state.riposte = riposte;
  emit(ctx, { type: 'riposte', ...riposte });
}

// ---------------------------------------------------------------------------
// Daredevils taking the blow

/** Guards of one kind standing by, earliest first. */
function guards(state: GameState, name: 'Intervention Dodge' | 'Shield'): GuardPending[] {
  return state.guards.filter((g) => heroAction(g.card).name === name).sort((a, b) => a.placed - b.placed);
}

function useGuard(ctx: Context, guard: GuardPending): void {
  const { state } = ctx;
  const index = state.guards.indexOf(guard);
  if (index < 0) throw new Error(`${guard.card} is not standing by`);
  state.guards.splice(index, 1);
  discard(state.heroDeck, guard.card);
  emit(ctx, { type: 'guard', player: guard.actor, card: guard.card });
}

function* hit(ctx: Context, seat: number, damage: number, knockdown: boolean): Step {
  const hero = ctx.state.heroes[seat];
  hero.hp = Math.max(0, hero.hp - damage);
  emit(ctx, { type: 'hit', player: seat, damage, hp: hero.hp });
  if (isIncapacitated(hero)) {
    incapacitate(ctx, seat);
    return;
  }
  if (knockdown) knockDown(ctx, seat);
  yield* enforceHandLimit(ctx, seat);
}

/**
 * Knockdown (2.2): cancels the daredevil's current action and knocks them to
 * the ground — the cancelling applies to a daredevil already on the ground too (#38).
 */
function knockDown(ctx: Context, seat: number): void {
  cancelActionsOf(ctx, seat, 'knockdown');
  ctx.state.heroes[seat].prone = true;
  emit(ctx, { type: 'knockdown', player: seat });
}

/**
 * 0 HP (2.3): no cards in hand, no longer a target. Dropping to 0 HP is an
 * automatic knockdown: the daredevil's actions on the board are cancelled and
 * they lie on the ground (author, #38; the sample gameplay marks them "0↓").
 */
function incapacitate(ctx: Context, seat: number): void {
  const hero = ctx.state.heroes[seat];
  cancelActionsOf(ctx, seat, 'incapacitated');
  for (const card of [...hero.hand]) discardFromHand(ctx, seat, card, 'incapacitated');
  hero.prone = true;
  emit(ctx, { type: 'incapacitated', player: seat });
  if (ctx.state.target === seat) setTarget(ctx, null);
}

// ---------------------------------------------------------------------------
// Special actions

/**
 * Roar (2.2): cancels every daredevil action on the board, guards included;
 * then each player, in seat order, discards 2 cards of their choice — or all
 * they have, if fewer (#38).
 */
function* roar(ctx: Context): Step {
  const { state } = ctx;
  for (let seat = 0; seat < state.config.players; seat++) cancelActionsOf(ctx, seat, 'roar');
  for (let seat = 0; seat < state.config.players; seat++) yield* discardCards(ctx, seat, 2, 'roar');
}

/** Health Regeneration (2.2): the weakest body part, ties in the order jaws, paws, legs, tail. */
function regenerate(ctx: Context, amount: number): void {
  const { parts } = ctx.state;
  let weakest: BodyPart = BODY_PARTS[0];
  for (const part of BODY_PARTS) if (parts[part].hp < parts[weakest].hp) weakest = part;
  const before = parts[weakest].hp;
  parts[weakest].hp = Math.min(MAX_HP, before + amount);
  emit(ctx, { type: 'regenerate', part: weakest, amount: parts[weakest].hp - before, hp: parts[weakest].hp });
}

/**
 * Glare (2.2): shifts the target by `steps` seats, clockwise for +1 (right),
 * skipping incapacitated daredevils. Without a target the dragon starts between
 * the daredevil who had the previous turn and the next one.
 */
function glare(ctx: Context, direction: 1 | -1, steps: number): void {
  const { state } = ctx;
  const n = state.config.players;
  let seat: number;
  if (state.target !== null) {
    seat = state.target;
  } else {
    // Stepping right from the previous player, or left from the next one,
    // reaches the first daredevil on that side of the gap.
    const previous = seatOf(state.turn, n);
    seat = direction === 1 ? previous : (previous + 1) % n;
  }
  for (let i = 0; i < steps; i++) seat = nextActive(state, seat, direction);
  setTarget(ctx, seat);
}

/** The nearest daredevil from `seat` in a direction who is not incapacitated. */
function nextActive(state: GameState, seat: number, direction: 1 | -1): number {
  const n = state.config.players;
  for (let k = 1; k <= n; k++) {
    const next = (((seat + direction * k) % n) + n) % n;
    if (!isIncapacitated(state.heroes[next])) return next;
  }
  throw new Error('every daredevil is incapacitated');
}
