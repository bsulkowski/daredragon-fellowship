// The moves of the sample gameplay (rules/sample_gameplay_en.md), recorded as
// data so that the engine can replay it.
//
// The markdown stays the source of truth. This file holds only what a player
// or the decks decide: cards played, cards dealt, cards drawn by the dragon,
// targets chosen at resolution and discards. The game state is not copied here.
//
// Turn k is a daredevil turn, k❖ (`dragon: true`) the dragon turn after it.
// Turns where nothing is decided and no card is drawn are omitted.

import type { BodyPart } from '../../src/actions.ts';
import type { Card } from '../../src/cards.ts';
import type { Phase, Setup } from '../../src/state.ts';

export const NAMES = ['Gorrak', 'Lirien', 'Pip', 'Magnus'];
const [GORRAK, LIRIEN, PIP, MAGNUS] = [0, 1, 2, 3];

export interface HeroMove {
  turn: number;
  dragon?: false;
  /** Targets chosen by the actions resolving this turn: a body part or a seat. */
  targets?: Partial<Record<Card, BodyPart | number>>;
  /** The card played, or the card dealt to each fellow player (by seat). */
  play?: Card;
  deal?: Partial<Record<number, Card>>;
  /** Cards discarded over the hand limit, in order. */
  discards?: Card[];
}

export interface DragonMove {
  turn: number;
  dragon: true;
  /** Cards the dragon plays from its deck this turn, in order. */
  draws?: Card[];
}

export type Move = HeroMove | DragonMove;

export interface Fragment {
  title: string;
  setup: Setup;
  moves: Move[];
  /** The last turn the fragment shows. */
  end: { turn: number; phase: Phase };
  /** Decisions the markdown leaves open; the replay takes the first option. */
  unspecified?: string[];
}

// ---------------------------------------------------------------------------

export const OVERTURE: Fragment = {
  title: 'Overture',
  setup: {
    turn: 1,
    heroes: [
      { hp: 25, hand: ['9♣', '7♠'] },
      { hp: 25, hand: ['8♦', 'Q♣'] },
      { hp: 25, hand: ['6♥', 'A♦'] },
      { hp: 25, hand: ['J♠', '3♥'] },
    ],
    target: null,
  },
  moves: [
    { turn: 1, deal: { [LIRIEN]: '3♦', [PIP]: '5♦', [MAGNUS]: '6♣' } },
    { turn: 1, dragon: true, draws: ['6♠'] },
    { turn: 2, deal: { [GORRAK]: '7♦', [PIP]: '4♥', [MAGNUS]: '8♣' } },
    { turn: 2, dragon: true, draws: ['3♥', '7♣'] },
    { turn: 3, deal: { [GORRAK]: '4♠', [LIRIEN]: 'J♥', [MAGNUS]: '9♠' } },
    { turn: 4, play: 'J♠' },
    { turn: 5, play: '7♠' },
    { turn: 5, dragon: true, draws: ['2♦', 'Q♦'] },
    { turn: 6, play: '8♦' },
    { turn: 7, targets: { '7♠': 'paws' }, play: 'A♦' },
    { turn: 8, deal: { [GORRAK]: '2♠', [LIRIEN]: 'K♥', [PIP]: '7♥' } },
    { turn: 9, targets: { '8♦': 'jaws' }, play: '9♣' },
    { turn: 10, play: '3♦' },
    { turn: 11, play: '7♥' },
    { turn: 11, dragon: true, draws: ['10♠'] },
    { turn: 12, play: '8♣' },
    { turn: 13, targets: { '9♣': 'legs', '7♥': 'paws' }, play: '7♦' },
  ],
  end: { turn: 13, phase: 'dragon' },
};

export const TRIAL_OF_STRENGTH: Fragment = {
  title: 'Trial of Strength',
  setup: {
    turn: 51,
    heroes: [
      { hp: 16, prone: true, hand: ['7♣', 'J♠', 'K♦'] },
      { hp: 20, hand: ['Q♦', '6♣', '2♥'] },
      { hp: 15, hand: ['2♣', '8♠', 'J♥'] },
      { hp: 14, prone: true, hand: ['10♦', '5♠'] },
    ],
    parts: { jaws: { hp: 14 }, paws: { hp: 12 }, legs: { hp: 8 }, tail: { hp: 22 } },
    target: MAGNUS,
    dragon: { card: 'K♠', played: 50, resolves: 54, cooldownEnds: null },
  },
  moves: [
    { turn: 51, play: '2♣' },
    { turn: 52, deal: { [GORRAK]: '9♠', [LIRIEN]: 'Q♣', [PIP]: '6♥' } },
    { turn: 53, targets: { '2♣': GORRAK }, play: 'K♦' },
    { turn: 54, play: 'Q♦' },
    { turn: 55, play: 'J♥' },
    { turn: 56, play: '10♦' },
    { turn: 57, play: 'J♠' },
    { turn: 57, dragon: true, draws: ['3♣', '2♣', 'A♥'] },
    { turn: 58, play: 'Q♣' },
    { turn: 59, play: '8♠' },
    { turn: 60, targets: { '10♦': 'paws' }, play: '5♠' },
    { turn: 60, dragon: true, draws: ['5♣'] },
    { turn: 61, deal: { [LIRIEN]: '4♠', [PIP]: '3♥', [MAGNUS]: '5♦' } },
    { turn: 62, targets: { '8♠': 'paws', '5♠': 'legs' }, play: '2♥' },
    { turn: 63, play: '6♥' },
    { turn: 63, dragon: true, draws: ['A♣'] },
    { turn: 64, deal: { [GORRAK]: '2♦', [LIRIEN]: '7♥', [PIP]: 'K♣' } },
  ],
  end: { turn: 64, phase: 'dragon' },
  unspecified: ["64❖: the cards discarded after the Roar (\"2 cards of their choice\")"],
};

export const FINALE: Fragment = {
  title: 'Finale',
  setup: {
    turn: 101,
    heroes: [
      { hp: 5, hand: ['7♦', '3♠'] },
      { hp: 6, hand: ['Joker', '8♣', '4♦'] },
      { hp: 0, hand: [] },
      { hp: 3, hand: ['Q♣', '6♠'] },
    ],
    parts: { jaws: { hp: 6 }, paws: { hp: 0 }, legs: { hp: 0 }, tail: { hp: 6 } },
    target: MAGNUS,
  },
  moves: [
    { turn: 101, play: '7♦' },
    { turn: 101, dragon: true, draws: ['J♦'] },
    { turn: 102, play: 'Joker' },
    { turn: 103, targets: { '7♦': 'jaws' }, deal: { [GORRAK]: '5♣', [LIRIEN]: '7♠', [MAGNUS]: '9♦' } },
    { turn: 104, play: 'Q♣' },
    { turn: 105, play: '5♣' },
    { turn: 106, targets: { Joker: PIP }, deal: { [GORRAK]: '2♥', [PIP]: '6♦' } },
    { turn: 106, dragon: true, draws: ['Joker'] },
    { turn: 107, play: '6♦' },
    { turn: 108, targets: { '5♣': 'jaws' }, deal: { [GORRAK]: 'K♣', [LIRIEN]: '9♥', [PIP]: '6♥' }, discards: ['4♦'] },
    { turn: 108, dragon: true, draws: ['4♣', 'Q♥'] },
    { turn: 109, targets: { '6♦': 'paws' }, play: 'K♣' },
    { turn: 110, play: '9♥' },
    { turn: 111, play: '6♥' },
    { turn: 112, deal: { [GORRAK]: 'A♠', [LIRIEN]: '5♦', [PIP]: '3♥' } },
    { turn: 113, targets: { '6♥': 'paws' }, deal: { [LIRIEN]: '2♣', [PIP]: '10♦' }, discards: ['8♣'] },
    { turn: 114, targets: { '9♥': 'tail' } },
  ],
  end: { turn: 114, phase: 'hero' },
};

export const FRAGMENTS: readonly Fragment[] = [OVERTURE, TRIAL_OF_STRENGTH, FINALE];
