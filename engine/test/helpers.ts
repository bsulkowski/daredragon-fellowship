// Test helpers: agents and event recording.

import type { Card } from '../src/cards.ts';
import type { DeckName } from '../src/core.ts';
import type { Agent, Decision } from '../src/decisions.ts';
import type { GameEvent } from '../src/events.ts';
import { createRng, nextInt } from '../src/random.ts';
import type { GameState } from '../src/state.ts';

/** An agent answering with a function of the decision. */
export function agent(decide: (d: Decision, s: Readonly<GameState>) => number): Agent {
  return { decide };
}

/** Always deals cards on its turn; discards the first option. */
export const alwaysDraw: Agent = agent((d) => (d.kind === 'turn' ? d.options.findIndex((o) => o.type === 'draw') : 0));

/** Plays `card` when it is an option, otherwise behaves like alwaysDraw. */
export function playWhenPossible(card: Card, player?: number): Agent {
  return agent((d, s) => {
    if (d.kind === 'turn' && (player === undefined || d.player === player)) {
      const i = d.options.findIndex((o) => o.type === 'play' && o.card === card);
      if (i >= 0) return i;
    }
    return alwaysDraw.decide(d, s);
  });
}

/** Uniformly random choices from its own seeded stream. */
export function randomAgent(seed: number): Agent {
  const rng = createRng(seed);
  return agent((d) => nextInt(rng, d.options.length));
}

export interface Recorded {
  turn: number;
  phase: string;
  event: GameEvent;
}

/** Records events together with the turn they happened in. */
export function recorder(): { events: Recorded[]; onEvent: (e: GameEvent, s: Readonly<GameState>) => void } {
  const events: Recorded[] = [];
  return { events, onEvent: (event, s) => events.push({ turn: s.turn, phase: s.phase, event }) };
}

/** A nextCard hook forcing the given cards, per deck, in order. */
export function forced(cards: Partial<Record<DeckName, Card[]>>) {
  const queues = { hero: [...(cards.hero ?? [])], dragon: [...(cards.dragon ?? [])] };
  return (deck: DeckName) => queues[deck].shift();
}
