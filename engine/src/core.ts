// Shared machinery of the engine: the running context, asking agents,
// drawing, hand limits and the end of the game.

import { BODY_PARTS } from './actions.ts';
import type { Card } from './cards.ts';
import { type Decision, type DiscardReason, distinct } from './decisions.ts';
import { discard, draw, forceNext } from './deck.ts';
import type { CancelReason, GameEvent, HandLossReason } from './events.ts';
import {
  type GameState, type GuardPending, type HeroPending, type Outcome, type OutcomeResult,
  handLimit, isIncapacitated,
} from './state.ts';

export type DeckName = 'hero' | 'dragon';

export interface PlayOptions {
  /** Called after every event, with the state as it is right after it. */
  onEvent?: (event: GameEvent, state: Readonly<GameState>) => void;
  /**
   * Called before every draw. Returning a card forces it to be drawn next
   * (it must be in that deck's draw or discard pile); returning undefined
   * draws normally. Used to replay known games such as the sample gameplay.
   */
  nextCard?: (deck: DeckName, state: Readonly<GameState>) => Card | undefined;
  /** End the game as a timeout when this daredevil turn number is exceeded. */
  maxTurns?: number;
}

export interface Context {
  state: GameState;
  options: PlayOptions;
}

/** A generator step of the engine: yields decisions, receives chosen indices. */
export type Step<T = void> = Generator<Decision, T, number>;

/** Thrown to unwind the engine once the outcome is set. */
export class GameOver extends Error {}

export function emit(ctx: Context, event: GameEvent): void {
  ctx.options.onEvent?.(event, ctx.state);
}

/** Issues a decision and returns the chosen index; single-option decisions are answered automatically. */
export function* ask(decision: Decision): Step<number> {
  const n = decision.options.length;
  if (n === 0) throw new Error(`decision without options: ${decision.kind}`);
  if (n === 1) return 0;
  const choice = yield decision;
  if (!Number.isInteger(choice) || choice < 0 || choice >= n) {
    throw new RangeError(`invalid choice ${choice} for a ${decision.kind} decision with ${n} options`);
  }
  return choice;
}

/**
 * Draws from a deck, honouring a forced card. An empty draw pile is replaced
 * by the shuffled discard pile — rules 1.9 say so for the daredevils' deck;
 * the dragon's deck is treated the same way (provisional reading, #38).
 */
export function drawCard(ctx: Context, deck: DeckName): Card | undefined {
  const { state } = ctx;
  const pile = deck === 'hero' ? state.heroDeck : state.dragonDeck;
  const forced = ctx.options.nextCard?.(deck, state);
  if (forced !== undefined) forceNext(pile, forced);
  return draw(pile, state.rng);
}

/** Removes one copy of a card from a hand to the daredevils' discard pile. */
export function discardFromHand(ctx: Context, player: number, card: Card, reason: HandLossReason): void {
  const hand = ctx.state.heroes[player].hand;
  const index = hand.indexOf(card);
  if (index < 0) throw new Error(`${ctx.state.heroes[player].name} has no ${card}`);
  hand.splice(index, 1);
  discard(ctx.state.heroDeck, card);
  emit(ctx, { type: 'discard', player, card, reason });
}

/** Lets a player discard cards of their choice (one decision per card). */
export function* discardCards(ctx: Context, player: number, count: number, reason: DiscardReason): Step {
  const hand = ctx.state.heroes[player].hand;
  for (let remaining = Math.min(count, hand.length); remaining > 0; remaining--) {
    const options = distinct(hand);
    const choice = yield* ask({ kind: 'discard', player, reason, remaining, options });
    discardFromHand(ctx, player, options[choice], reason);
  }
}

/** "If at any time a player has more cards in hand than their limit, they must discard the excess" (1.9). */
export function* enforceHandLimit(ctx: Context, player: number): Step {
  const hero = ctx.state.heroes[player];
  const excess = hero.hand.length - handLimit(hero.hp);
  if (excess > 0) yield* discardCards(ctx, player, excess, 'hand-limit');
}

/** Sets the dragon's attack target, reporting a change. */
export function setTarget(ctx: Context, target: number | null): void {
  if (ctx.state.target === target) return;
  ctx.state.target = target;
  emit(ctx, { type: 'target', target });
}

/** Takes an action or guard off the board to the daredevils' discard pile. */
export function cancel(ctx: Context, action: HeroPending | GuardPending, reason: CancelReason): void {
  const { state } = ctx;
  const list: (HeroPending | GuardPending)[] = 'resolves' in action ? state.pending : state.guards;
  const index = list.indexOf(action);
  if (index < 0) throw new Error(`${action.card} is not on the board`);
  list.splice(index, 1);
  discard(state.heroDeck, action.card);
  emit(ctx, { type: 'cancel', player: action.actor, card: action.card, reason });
}

/** Cancels everything a daredevil has on the board — "the daredevil's current action". */
export function cancelActionsOf(ctx: Context, player: number, reason: CancelReason): void {
  const { state } = ctx;
  for (const action of [...state.pending, ...state.guards]) if (action.actor === player) cancel(ctx, action, reason);
}

export function outcomeOf(state: GameState, result: OutcomeResult): Outcome {
  return {
    result,
    turn: state.turn,
    phase: state.phase,
    partsHp: BODY_PARTS.map((p) => state.parts[p].hp),
    heroesHp: state.heroes.map((h) => h.hp),
  };
}

export function finish(ctx: Context, result: OutcomeResult): never {
  const outcome = outcomeOf(ctx.state, result);
  ctx.state.outcome = outcome;
  emit(ctx, { type: 'end', outcome });
  throw new GameOver(result);
}

/** Victory when every body part is at 0; defeat when every daredevil is incapacitated (1.7). */
export function checkEnd(ctx: Context): void {
  const { state } = ctx;
  if (BODY_PARTS.every((p) => state.parts[p].hp === 0)) finish(ctx, 'victory');
  if (state.heroes.every(isIncapacitated)) finish(ctx, 'defeat');
}
