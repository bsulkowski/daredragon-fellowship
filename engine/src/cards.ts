// Playing cards. A card is a plain string in the notation of the rules and the
// sample gameplay: rank followed by suit ('9♣', '10♠', 'Q♦'), or 'Joker'.
// Plain strings keep game states and fixtures readable and serialisable.

export type Card = string;

export const SUITS = ['♠', '♥', '♦', '♣'] as const;
export type Suit = (typeof SUITS)[number];

export const RANKS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'] as const;
export type Rank = (typeof RANKS)[number];

export const JOKER = 'Joker';

export type Color = 'red' | 'black';

export interface ParsedCard {
  rank: Rank | typeof JOKER;
  /** null for a Joker */
  suit: Suit | null;
}

const RANK_SET = new Set<string>(RANKS);
const SUIT_SET = new Set<string>(SUITS);

/** Parses a card string. Throws on anything that is not a card of a standard 54-card deck. */
export function parseCard(card: Card): ParsedCard {
  if (card === JOKER) return { rank: JOKER, suit: null };
  const suit = card.slice(-1);
  const rank = card.slice(0, -1);
  if (!SUIT_SET.has(suit) || !RANK_SET.has(rank)) throw new RangeError(`not a card: ${JSON.stringify(card)}`);
  return { rank: rank as Rank, suit: suit as Suit };
}

export function isCard(value: unknown): value is Card {
  if (typeof value !== 'string') return false;
  try {
    parseCard(value);
    return true;
  } catch {
    return false;
  }
}

export function rankOf(card: Card): Rank | typeof JOKER {
  return parseCard(card).rank;
}

export function suitOf(card: Card): Suit | null {
  return parseCard(card).suit;
}

/** Hearts and diamonds are red, spades and clubs black; a Joker has no colour. */
export function colorOf(card: Card): Color | null {
  const suit = suitOf(card);
  if (suit === null) return null;
  return suit === '♥' || suit === '♦' ? 'red' : 'black';
}

/** A standard 54-card deck (rules 1.1): 52 cards and 2 jokers, in a fixed order. */
export function fullDeck(): Card[] {
  const cards: Card[] = [];
  for (const suit of SUITS) for (const rank of RANKS) cards.push(rank + suit);
  cards.push(JOKER, JOKER);
  return cards;
}
