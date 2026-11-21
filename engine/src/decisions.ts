// The decision interface. Whenever the rules leave a choice to a player, the
// engine issues a Decision listing every legal option, and an agent answers
// with the index of the option it picks. The same interface serves random
// play, the Dummy, the sample gameplay validator and, later, human players.
//
// Decisions with a single legal option are not issued; the engine takes that
// option itself.

import type { BodyPart, HeroActionName } from './actions.ts';
import type { Card } from './cards.ts';
import type { GameState } from './state.ts';

/** On a daredevil's turn: play a card from hand, or deal cards to the others (rules 1.5, 1.9). */
export type TurnOption = { type: 'play'; card: Card } | { type: 'draw' };

/** Target of a daredevil's action, chosen when the action resolves (rules 1.5). */
export type TargetOption = { type: 'part'; part: BodyPart } | { type: 'hero'; hero: number };

export type DiscardReason = 'hand-limit' | 'roar';

export type Decision =
  | {
      kind: 'turn';
      player: number;
      options: TurnOption[];
    }
  | {
      kind: 'target';
      player: number;
      /** The card of the action being resolved. */
      card: Card;
      action: HeroActionName;
      options: TargetOption[];
    }
  | {
      kind: 'discard';
      player: number;
      reason: DiscardReason;
      /** Cards still to discard, including this one. */
      remaining: number;
      /** Distinct cards in hand; one is discarded per decision. */
      options: Card[];
    };

export type DecisionKind = Decision['kind'];

export interface Agent {
  /** Returns the index of the chosen option in `decision.options`. */
  decide(decision: Decision, state: Readonly<GameState>): number;
}

/** Distinct values, first occurrence order (two Jokers in a hand are one option). */
export function distinct<T>(items: readonly T[]): T[] {
  return [...new Set(items)];
}
