import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JOKER, colorOf, fullDeck, isCard, parseCard, rankOf, suitOf } from '../src/cards.ts';

test('a full deck has 54 cards: 13 of each suit and 2 jokers', () => {
  const deck = fullDeck();
  assert.equal(deck.length, 54);
  assert.equal(new Set(deck).size, 53);
  assert.equal(deck.filter((c) => c === JOKER).length, 2);
  for (const suit of ['♠', '♥', '♦', '♣']) assert.equal(deck.filter((c) => c.endsWith(suit)).length, 13);
});

test('parsing cards in the notation of the rules', () => {
  assert.deepEqual(parseCard('9♣'), { rank: '9', suit: '♣' });
  assert.deepEqual(parseCard('10♠'), { rank: '10', suit: '♠' });
  assert.deepEqual(parseCard('Q♦'), { rank: 'Q', suit: '♦' });
  assert.deepEqual(parseCard(JOKER), { rank: JOKER, suit: null });
  assert.equal(rankOf('A♥'), 'A');
  assert.equal(suitOf('A♥'), '♥');
  assert.equal(suitOf(JOKER), null);
});

test('malformed cards are rejected', () => {
  for (const bad of ['', '1♠', '11♣', 'Q', '♠', 'D♠', 'W♥', 'joker', 'Q♤', '10']) {
    assert.throws(() => parseCard(bad), RangeError, bad);
    assert.equal(isCard(bad), false, bad);
  }
  assert.equal(isCard(42), false);
  assert.equal(isCard('K♣'), true);
});

test('colours', () => {
  assert.equal(colorOf('3♥'), 'red');
  assert.equal(colorOf('3♦'), 'red');
  assert.equal(colorOf('3♠'), 'black');
  assert.equal(colorOf('3♣'), 'black');
  assert.equal(colorOf(JOKER), null);
});
