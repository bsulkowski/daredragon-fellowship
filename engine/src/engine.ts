// The turn loop (rules 1.4–1.6, 1.9): interleaved daredevil and dragon turns,
// the board timeline of warm-ups and cool-downs, and the decision points.
//
// The engine is a generator: it yields a Decision whenever a player has a
// choice and is resumed with the index of the chosen option. `runGame` drives
// it with agents; a user interface can drive it step by step.
//
// Effects of the dragon's actions live in dragon.ts. Effects of the
// daredevils' actions are added in #37; the hooks it fills in are marked below.

import { dragonAction, heroAction, isAttack } from './actions.ts';
import type { Card } from './cards.ts';
import {
  type Context, type PlayOptions, type Step,
  GameOver, ask, checkEnd, drawCard, emit, enforceHandLimit, finish,
} from './core.ts';
import { type Agent, type Decision, type TurnOption, distinct } from './decisions.ts';
import { discard } from './deck.ts';
import { dragonWarmup, resolveDragonAction, resolveDragonInstant } from './dragon.ts';
import { type GameState, type HeroPending, type Outcome, isIncapacitated, seatOf } from './state.ts';

export type { PlayOptions } from './core.ts';

/**
 * Plays a game from its current state. Yields decisions; resume with the index
 * of the chosen option. Returns the outcome. The state is mutated in place.
 */
export function* play(state: GameState, options: PlayOptions = {}): Generator<Decision, Outcome, number> {
  const ctx: Context = { state, options };
  if (state.outcome) return state.outcome;
  try {
    checkEnd(ctx);
    for (;;) {
      if (state.phase === 'hero') {
        if (options.maxTurns !== undefined && state.turn > options.maxTurns) finish(ctx, 'timeout');
        yield* heroTurn(ctx);
        state.phase = 'dragon';
      } else {
        yield* dragonTurn(ctx);
        state.phase = 'hero';
        state.turn++;
      }
    }
  } catch (error) {
    if (error instanceof GameOver) return state.outcome!;
    throw error;
  }
}

/** Plays a game to the end, asking one agent for all seats or one agent per seat. */
export function runGame(state: GameState, agents: Agent | readonly Agent[], options: PlayOptions = {}): Outcome {
  const game = play(state, options);
  let step = game.next();
  while (!step.done) {
    const decision = step.value;
    const agent = 'decide' in agents ? agents : agents[decision.player];
    step = game.next(agent.decide(decision, state));
  }
  return step.value;
}

// ---------------------------------------------------------------------------
// Daredevil turn

function* heroTurn(ctx: Context): Step {
  const { state } = ctx;
  const turn = state.turn;
  const seat = seatOf(turn, state.config.players);
  emit(ctx, { type: 'turn', turn, phase: 'hero' });

  // A guard stays until its owner's next turn (1.5).
  for (const guard of state.guards.filter((g) => g.expires === turn)) {
    state.guards.splice(state.guards.indexOf(guard), 1);
    discard(state.heroDeck, guard.card);
    emit(ctx, { type: 'guard-expired', player: guard.actor, card: guard.card });
  }

  // Actions whose warm-up expires resolve at the start of the turn (1.5),
  // in the order they were initiated (provisional reading, #38).
  const due = state.pending.filter((p) => p.resolves === turn).sort((a, b) => a.played - b.played);
  for (const action of due) {
    const index = state.pending.indexOf(action);
    if (index < 0) continue; // cancelled meanwhile
    state.pending.splice(index, 1);
    yield* resolveHeroAction(ctx, action, due);
    discard(state.heroDeck, action.card);
    emit(ctx, { type: 'resolve', player: action.actor, card: action.card });
    checkEnd(ctx);
  }

  const hero = state.heroes[seat];
  const options: TurnOption[] = [];
  if (!isIncapacitated(hero)) {
    for (const card of distinct(hero.hand)) if (canPlay(ctx, seat, card)) options.push({ type: 'play', card });
  }
  options.push({ type: 'draw' });
  const choice = options[yield* ask({ kind: 'turn', player: seat, options })];
  if (choice.type === 'play') playCard(ctx, seat, choice.card);
  else yield* dealCards(ctx, seat);
  checkEnd(ctx);
}

/** Initiates an action: the card goes to the turn on which its warm-up expires (1.5). */
function playCard(ctx: Context, seat: number, card: Card): void {
  const { state } = ctx;
  const hand = state.heroes[seat].hand;
  const index = hand.indexOf(card);
  if (index < 0) throw new Error(`${state.heroes[seat].name} has no ${card}`);
  hand.splice(index, 1);
  const action = heroAction(card);
  if (action.guard) {
    // Guards have no warm-up; they stand by until the player's next turn.
    state.guards.push({ actor: seat, card, placed: state.turn, expires: state.turn + state.config.players });
    emit(ctx, { type: 'play', player: seat, card, resolves: null });
  } else {
    const resolves = state.turn + heroWarmup(ctx, seat, card);
    state.pending.push({ actor: seat, card, played: state.turn, resolves });
    emit(ctx, { type: 'play', player: seat, card, resolves });
  }
}

/**
 * Cooperative card draw (1.9): one card to each fellow player, clockwise.
 * Incapacitated players are skipped, as in the sample gameplay (provisional, #38).
 */
function* dealCards(ctx: Context, seat: number): Step {
  const { state } = ctx;
  const n = state.config.players;
  for (let i = 1; i < n; i++) {
    const to = (seat + i) % n;
    if (isIncapacitated(state.heroes[to])) continue;
    const card = drawCard(ctx, 'hero');
    if (card === undefined) return;
    state.heroes[to].hand.push(card);
    emit(ctx, { type: 'deal', from: seat, to, card });
    yield* enforceHandLimit(ctx, to);
  }
}

// ---------------------------------------------------------------------------
// Dragon turn

function* dragonTurn(ctx: Context): Step {
  const { state } = ctx;
  const turn = state.turn;
  emit(ctx, { type: 'turn', turn, phase: 'dragon' });

  const current = state.dragon;
  if (current && current.cooldownEnds === null) {
    if (current.resolves < turn) throw new Error(`dragon card ${current.card} missed its turn ${current.resolves}❖`);
    if (current.resolves === turn) {
      // The action resolves, followed by a cool-down (1.6).
      const action = dragonAction(current.card);
      const extraCooldown = yield* resolveDragonAction(ctx, current.card, action);
      current.cooldownEnds = turn + action.cooldown + extraCooldown;
      emit(ctx, { type: 'dragon-resolve', card: current.card, cooldownEnds: current.cooldownEnds });
      checkEnd(ctx);
      return;
    }
  }
  if (current && current.cooldownEnds === turn) {
    state.dragon = null;
    discard(state.dragonDeck, current.card);
    emit(ctx, { type: 'dragon-ready', card: current.card });
  }
  if (state.dragon === null) yield* dragonPlay(ctx);
}

/** The ready dragon plays the top card of its deck (1.6). */
function* dragonPlay(ctx: Context): Step {
  const { state } = ctx;
  for (;;) {
    const card = drawCard(ctx, 'dragon');
    if (card === undefined) throw new Error("the dragon's deck is empty");
    const action = dragonAction(card);

    if (action.warmup === 0 && action.cooldown === 0) {
      // Resolves at once; the next card is played within the same turn.
      resolveDragonInstant(ctx, card, action);
      discard(state.dragonDeck, card);
      emit(ctx, { type: 'dragon-instant', card });
      checkEnd(ctx);
      continue;
    }
    if (isAttack(action) && state.target === null) {
      // No target: the dragon merely menaces and the turn ends. The body part
      // is not used, so an entanglement stays (#38).
      discard(state.dragonDeck, card);
      emit(ctx, { type: 'dragon-menace', card });
      return;
    }
    const resolves = state.turn + dragonWarmup(state, action);
    state.dragon = { card, played: state.turn, resolves, cooldownEnds: null };
    emit(ctx, { type: 'dragon-play', card, resolves });
    return;
  }
}

// ---------------------------------------------------------------------------
// Hooks for the effects of the daredevils' actions — filled in by #37.

/** Whether a daredevil may play a card now (on-ground restrictions: #37). */
function canPlay(_ctx: Context, _seat: number, _card: Card): boolean {
  return true;
}

/** Warm-up of a daredevil's action in daredevil turns (on-ground +1: #37). */
function heroWarmup(_ctx: Context, _seat: number, card: Card): number {
  return heroAction(card).warmup!;
}

/** Effect of a daredevil action (#37). `due` lists all actions resolving this turn. */
function* resolveHeroAction(_ctx: Context, _action: HeroPending, _due: readonly HeroPending[]): Step {}
