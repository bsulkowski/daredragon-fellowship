// Effects of the daredevils' actions (rules 2.1) and the restrictions on a
// daredevil lying on the ground. Readings of the rules that are not spelled
// out in the text are marked #38 (see AMBIGUITIES.md).

import { BODY_PARTS, type BodyPart, type HeroAction, dragonAction, heroAction, isAttack } from './actions.ts';
import { type Card, suitOf } from './cards.ts';
import { type Context, type Step, ask, emit, setTarget } from './core.ts';
import { modify } from './dracometer.ts';
import { type GameState, type HeroPending, MAX_HP, isIncapacitated } from './state.ts';

/** Ϟ steps of a riposte (2.1 Attack). */
export const RIPOSTE_STEPS = 2;

/**
 * Whether a daredevil may play a card. On the ground they cannot play guards
 * or actions with a base warm-up of 4 (2.1 On the ground); incapacitated
 * daredevils cannot play at all (2.3).
 */
export function canPlay(state: GameState, seat: number, card: Card): boolean {
  const hero = state.heroes[seat];
  if (isIncapacitated(hero)) return false;
  if (!hero.prone) return true;
  const action = heroAction(card);
  return !action.guard && action.warmup !== 4;
}

/** Warm-up in daredevil turns, fixed when the card is played: +1 on the ground (2.1; author, #38). */
export function heroWarmup(state: GameState, seat: number, card: Card): number {
  return heroAction(card).warmup! + (state.heroes[seat].prone ? 1 : 0);
}

/** Bookkeeping shared by the actions resolving at the start of one turn. */
export interface Resolution {
  /** Every action resolving this turn, in the order they resolve. */
  due: readonly HeroPending[];
  /** The current target was taken by an attack resolving this turn. */
  targetTakenByAttack: boolean;
}

/** Effect of a daredevil's action when its warm-up expires; targets are chosen now (1.5). */
export function* resolveHeroAction(ctx: Context, pending: HeroPending, round: Resolution): Step {
  const action = heroAction(pending.card);
  switch (action.name) {
    case 'Draw Aggro':
      drawAggro(ctx, pending, round);
      return;
    case 'Helping Hand':
      yield* helpingHand(ctx, pending, action);
      return;
    case 'First Aid':
      yield* firstAid(ctx, pending, action);
      return;
    case 'Intervention Dodge':
    case 'Shield':
      throw new Error(`${action.name} is a guard and does not resolve`);
    default:
      yield* attack(ctx, pending, action, round);
  }
}

// ---------------------------------------------------------------------------
// Attacks

/**
 * Attack (2.1): damage to the chosen body part, or the entanglement for
 * Entangle. Entangle is an attack too: it counts for the orchestrated attack
 * and takes the target (#38), but deals no damage whatever the modifiers (#38).
 */
function* attack(ctx: Context, pending: HeroPending, action: HeroAction, round: Resolution): Step {
  const { state } = ctx;
  const entangle = action.name === 'Entangle';
  // "Can only be applied to a body part that is not currently being used in an
  // attack": the part of the dragon's attack warming up (#38).
  const busy = entangle ? partInUse(state) : null;
  const parts = BODY_PARTS.filter((p) => p !== busy);
  const choice = yield* ask({
    kind: 'target', player: pending.actor, card: pending.card, action: action.name,
    options: parts.map((part) => ({ type: 'part', part })),
  });
  const part = parts[choice];

  if (entangle) {
    state.parts[part].entangled = true;
    emit(ctx, { type: 'entangle', player: pending.actor, part });
  } else {
    const damage = modify(action.damage!, attackSteps(state, pending, part, round.due));
    const target = state.parts[part];
    target.hp = Math.max(0, target.hp - damage);
    emit(ctx, { type: 'strike', player: pending.actor, card: pending.card, part, damage, hp: target.hp });
  }

  // With no target, the dragon takes the attacker; of several attacks resolving
  // on one turn, the one initiated last (2.1 Attack).
  if (state.target === null || round.targetTakenByAttack) {
    setTarget(ctx, pending.actor);
    round.targetTakenByAttack = true;
  }
}

/**
 * Ϟ steps of a daredevil's attack, all evaluated at resolution: riposte (+2),
 * entangled part (+1), orchestrated attack (+1 per other attack of the same
 * suit resolving this turn; author, #38), the attacker at 13–1 HP (−1, 2.3) and on the
 * ground (−2; evaluated at resolution; author, #24, #38).
 */
function attackSteps(state: GameState, pending: HeroPending, part: BodyPart, due: readonly HeroPending[]): number {
  const attacker = state.heroes[pending.actor];
  let steps = 0;
  const riposte = state.riposte;
  if (riposte && riposte.part === part && state.turn >= riposte.from && state.turn <= riposte.to) steps += RIPOSTE_STEPS;
  if (state.parts[part].entangled) steps += 1;
  const suit = suitOf(pending.card);
  steps += due.filter((o) => o !== pending && heroAction(o.card).type === 'attack' && suitOf(o.card) === suit).length;
  if (attacker.hp <= 13) steps -= 1;
  if (attacker.prone) steps -= 2;
  return steps;
}

/** The body part of the dragon's attack warming up, if any. */
function partInUse(state: GameState): BodyPart | null {
  const dragon = state.dragon;
  if (dragon === null || dragon.cooldownEnds !== null) return null;
  const action = dragonAction(dragon.card);
  return isAttack(action) ? action.part : null;
}

// ---------------------------------------------------------------------------
// Support

/**
 * Draw Aggro (2.1): the daredevil becomes the target; a dragon's attack warming
 * up resolves a turn later. Only an attack: the delay rewards drawing an attack
 * onto oneself and makes the dragon pay for redirecting it; Roar and Health
 * Regeneration are not delayed (author, #38).
 */
function drawAggro(ctx: Context, pending: HeroPending, round: Resolution): void {
  setTarget(ctx, pending.actor);
  round.targetTakenByAttack = false;
  const dragon = ctx.state.dragon;
  if (dragon && dragon.cooldownEnds === null && isAttack(dragonAction(dragon.card))) {
    dragon.resolves += 1;
    emit(ctx, { type: 'dragon-delay', card: dragon.card, resolves: dragon.resolves });
  }
}

/**
 * Helping Hand (2.1): another daredevil on the ground stands up. Incapacitated
 * daredevils are not eligible — only First Aid works on them (#38). With nobody
 * to help, the action has no effect.
 */
function* helpingHand(ctx: Context, pending: HeroPending, action: HeroAction): Step {
  const { heroes } = ctx.state;
  const eligible = heroes
    .map((_, seat) => seat)
    .filter((seat) => seat !== pending.actor && heroes[seat].prone && !isIncapacitated(heroes[seat]));
  const seat = yield* chooseHero(ctx, pending, action, eligible);
  if (seat !== null) standUp(ctx, seat, pending.actor);
}

/** First Aid (2.1): up to 8 HP to another daredevil, even incapacitated, who also stands up. */
function* firstAid(ctx: Context, pending: HeroPending, action: HeroAction): Step {
  const { heroes } = ctx.state;
  const eligible = heroes.map((_, seat) => seat).filter((seat) => seat !== pending.actor);
  const seat = yield* chooseHero(ctx, pending, action, eligible);
  if (seat === null) return;
  const hero = heroes[seat];
  const before = hero.hp;
  hero.hp = Math.min(MAX_HP, before + action.heal!);
  emit(ctx, { type: 'heal', player: seat, by: pending.actor, amount: hero.hp - before, hp: hero.hp });
  if (hero.prone) standUp(ctx, seat, pending.actor);
}

function* chooseHero(ctx: Context, pending: HeroPending, action: HeroAction, eligible: number[]): Step<number | null> {
  if (eligible.length === 0) {
    emit(ctx, { type: 'no-target', player: pending.actor, card: pending.card });
    return null;
  }
  const choice = yield* ask({
    kind: 'target', player: pending.actor, card: pending.card, action: action.name,
    options: eligible.map((hero) => ({ type: 'hero', hero })),
  });
  return eligible[choice];
}

function standUp(ctx: Context, seat: number, by: number): void {
  ctx.state.heroes[seat].prone = false;
  emit(ctx, { type: 'stand-up', player: seat, by });
}
