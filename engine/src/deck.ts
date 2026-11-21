// A deck with its discard pile. Plain data, so it can live inside a game state.
// The last element of each array is the top card.

import type { Card } from './cards.ts';
import { type Rng, shuffle } from './random.ts';

export interface Deck {
  drawPile: Card[];
  discardPile: Card[];
  /** How many times the discard pile has been shuffled back in. */
  reshuffles: number;
}

/** A deck holding the given cards, shuffled, with an empty discard pile. */
export function createDeck(cards: readonly Card[], rng: Rng): Deck {
  return { drawPile: shuffle(rng, [...cards]), discardPile: [], reshuffles: 0 };
}

/** A deck holding the given cards in the given order (last = top), without shuffling. */
export function stackedDeck(drawPile: readonly Card[], discardPile: readonly Card[] = []): Deck {
  return { drawPile: [...drawPile], discardPile: [...discardPile], reshuffles: 0 };
}

/**
 * Draws the top card. When the draw pile is empty, the discard pile is shuffled
 * and becomes the new draw pile first (rules 1.9). Returns undefined only when
 * both piles are empty.
 */
export function draw(deck: Deck, rng: Rng): Card | undefined {
  if (deck.drawPile.length === 0 && deck.discardPile.length > 0) {
    deck.drawPile = shuffle(rng, deck.discardPile);
    deck.discardPile = [];
    deck.reshuffles++;
  }
  return deck.drawPile.pop();
}

export function discard(deck: Deck, card: Card): void {
  deck.discardPile.push(card);
}

/** Top card of the discard pile, if any. */
export function topOfDiscard(deck: Deck): Card | undefined {
  return deck.discardPile[deck.discardPile.length - 1];
}

/**
 * Makes `card` the next card drawn, by moving it to the top of the draw pile.
 * It is taken from the draw pile or, failing that, from the discard pile.
 * Used to replay a known sequence of draws (e.g. the sample gameplay); the
 * other cards keep their order. Throws when the card is in neither pile.
 */
export function forceNext(deck: Deck, card: Card): void {
  for (const pile of [deck.drawPile, deck.discardPile]) {
    const index = pile.lastIndexOf(card);
    if (index >= 0) {
      pile.splice(index, 1);
      deck.drawPile.push(card);
      return;
    }
  }
  throw new Error(`cannot force ${card}: it is in neither the draw pile nor the discard pile`);
}
