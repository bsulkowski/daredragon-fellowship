// Events the engine reports while a game runs: the raw material for replays,
// game logs, statistics and debugging. Events describe what happened;
// the state after each event is available to the listener.

import type { BodyPart } from './actions.ts';
import type { Card } from './cards.ts';
import type { DiscardReason } from './decisions.ts';
import type { Outcome, Phase } from './state.ts';

/** Why cards leave a hand without being played. */
export type HandLossReason = DiscardReason | 'incapacitated';

/** Why an action on the board is taken off before it resolves. */
export type CancelReason = 'knockdown' | 'incapacitated' | 'roar';

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
  | { type: 'discard'; player: number; card: Card; reason: HandLossReason }
  /** An action or guard on the board is cancelled; its card is discarded. */
  | { type: 'cancel'; player: number; card: Card; reason: CancelReason }
  /** A daredevil's attack deals damage to a body part (possibly 0). */
  | { type: 'strike'; player: number; card: Card; part: BodyPart; damage: number; hp: number }
  | { type: 'entangle'; player: number; part: BodyPart }
  /** First Aid; `amount` is what was actually restored. */
  | { type: 'heal'; player: number; by: number; amount: number; hp: number }
  /** A daredevil gets up from the ground (Helping Hand, First Aid). */
  | { type: 'stand-up'; player: number; by: number }
  /** A support action resolves with nobody it could be used on. */
  | { type: 'no-target'; player: number; card: Card }
  /** Draw Aggro delays the dragon's action warming up. */
  | { type: 'dragon-delay'; card: Card; resolves: number }
  /** A guard reacts to the dragon's attack; its card is discarded. */
  | { type: 'guard'; player: number; card: Card }
  /** A daredevil takes damage from the dragon (possibly 0). */
  | { type: 'hit'; player: number; damage: number; hp: number }
  | { type: 'knockdown'; player: number }
  | { type: 'incapacitated'; player: number }
  /** The dragon's attack target changes. */
  | { type: 'target'; target: number | null }
  /** A riposte window opens: attacks on `part` in daredevil turns from–to get +2Ϟ. */
  | { type: 'riposte'; part: BodyPart; from: number; to: number }
  /** Health Regeneration; `amount` is what was actually restored. */
  | { type: 'regenerate'; part: BodyPart; amount: number; hp: number }
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
  /** A deck ran out and its discard pile was shuffled into a new one. */
  | { type: 'reshuffle'; deck: 'hero' | 'dragon' }
  | { type: 'end'; outcome: Outcome };

export type GameEventType = GameEvent['type'];
