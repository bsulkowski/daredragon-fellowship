import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fullDeck } from '../src/cards.ts';
import { createDeck, discard, draw, forceNext, stackedDeck, topOfDiscard } from '../src/deck.ts';
import { createRng } from '../src/random.ts';

const drawAll = (seed: number) => {
  const rng = createRng(seed);
  const deck = createDeck(fullDeck(), rng);
  const out: string[] = [];
  for (let card = draw(deck, rng); card !== undefined; card = draw(deck, rng)) out.push(card);
  return out;
};

test('a shuffled deck deals every card once, reproducibly from the seed', () => {
  const a = drawAll(9);
  assert.deepEqual(a, drawAll(9));
  assert.notDeepEqual(a, drawAll(10));
  assert.deepEqual([...a].sort(), fullDeck().sort());
});

test('the top card is the last element', () => {
  const rng = createRng(1);
  const deck = stackedDeck(['2♠', '3♠', '4♠']);
  assert.equal(draw(deck, rng), '4♠');
  assert.equal(draw(deck, rng), '3♠');
});

test('an empty draw pile is replaced by the shuffled discard pile (rules 1.9)', () => {
  const rng = createRng(2);
  const deck = stackedDeck(['K♥']);
  assert.equal(draw(deck, rng), 'K♥');
  for (const card of ['2♣', '3♣', '4♣', '5♣']) discard(deck, card);
  assert.equal(topOfDiscard(deck), '5♣');
  const redrawn = [draw(deck, rng), draw(deck, rng), draw(deck, rng), draw(deck, rng)];
  assert.equal(deck.reshuffles, 1);
  assert.deepEqual([...redrawn].sort(), ['2♣', '3♣', '4♣', '5♣']);
  assert.equal(topOfDiscard(deck), undefined);
  assert.equal(draw(deck, rng), undefined, 'both piles empty');
});

test('forcing the next card from the draw pile keeps the order of the rest', () => {
  const rng = createRng(3);
  const deck = stackedDeck(['2♠', '3♠', '4♠', '5♠']);
  forceNext(deck, '3♠');
  assert.deepEqual(deck.drawPile, ['2♠', '4♠', '5♠', '3♠']);
  assert.equal(draw(deck, rng), '3♠');
  assert.equal(draw(deck, rng), '5♠');
});

test('forcing a card that sits in the discard pile', () => {
  const rng = createRng(4);
  const deck = stackedDeck(['2♠'], ['Q♦', 'Joker']);
  forceNext(deck, 'Q♦');
  assert.deepEqual(deck.discardPile, ['Joker']);
  assert.equal(draw(deck, rng), 'Q♦');
  assert.equal(deck.reshuffles, 0);
});

test('forcing works with an empty draw pile and with duplicate jokers', () => {
  const rng = createRng(5);
  const deck = stackedDeck([], ['Joker', 'Joker']);
  forceNext(deck, 'Joker');
  assert.equal(draw(deck, rng), 'Joker');
  forceNext(deck, 'Joker');
  assert.equal(draw(deck, rng), 'Joker');
  assert.throws(() => forceNext(deck, 'Joker'), /neither/);
});

test('forcing a card that is not available throws', () => {
  const deck = stackedDeck(['2♠'], ['3♠']);
  assert.throws(() => forceNext(deck, 'A♠'), /cannot force A♠/);
});

test('a replayed sequence of forced draws: Turn 1 of the sample gameplay', () => {
  const rng = createRng(6);
  const inHands = ['9♣', '7♠', '8♦', 'Q♣', '6♥', 'A♦', 'J♠', '3♥'];
  const deck = createDeck(fullDeck().filter((c) => !inHands.includes(c)), rng);
  const dealt: string[] = [];
  for (const card of ['3♦', '5♦', '6♣']) {
    forceNext(deck, card);
    dealt.push(draw(deck, rng)!);
  }
  assert.deepEqual(dealt, ['3♦', '5♦', '6♣']);
  assert.equal(deck.drawPile.length, 54 - inHands.length - 3);
});
