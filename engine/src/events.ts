// Events the engine reports while a game runs: the raw material for the sample
// gameplay validator, game logs and debugging. Events describe what happened;
// the state after each event is available to the listener.

import type { Card } from './cards.ts';
import type { DiscardReason } from './decisions.ts';
import type { Outcome, Phase } from './state.ts';

export type GameEvent =
  /** A turn starts; nothing has resolved yet. */
  | { type: 'turn'; turn: number; phase: Phase }
  /** A guard reaches its owner's next turn unused. */
  | { type: 'guard-expired'; player: number; card: Card }
  /** A daredevil action resolves at the start of a turn. */
  | { type: 'resolve'; player: number; card: Card }
  /** A daredevil plays a card; `resolves` is null for a guard. */
  | { type: 'play'; player: number; card: Card; resolves: number | null }
  /** A card dealt from the daredevils' deck during cooperative card draw. */
  | { type: 'deal'; from: number; to: number; card: Card }
  | { type: 'discard'; player: number; card: Card; reason: DiscardReason }
  /** The dragon places a card on the board. */
  | { type: 'dragon-play'; card: Card; resolves: number }
  /** A card with warm-up and cool-down 0 (Glare) resolves at once. */
  | { type: 'dragon-instant'; card: Card }
  /** An attack played without a target is discarded: the dragon menaces. */
  | { type: 'dragon-menace'; card: Card }
  /** The dragon's card resolves and starts cooling down. */
  | { type: 'dragon-resolve'; card: Card; cooldownEnds: number }
  /** The cool-down ends; the card is discarded and the dragon is ready. */
  | { type: 'dragon-ready'; card: Card }
  | { type: 'end'; outcome: Outcome };

export type GameEventType = GameEvent['type'];
