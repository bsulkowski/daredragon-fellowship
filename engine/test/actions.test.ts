import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DRAGON_ACTIONS, HERO_ACTIONS, dragonAction, heroAction, isAttack } from '../src/actions.ts';
import { fullDeck } from '../src/cards.ts';

test('every card of a deck is exactly one daredevil action', () => {
  for (const card of fullDeck()) {
    const rows = HERO_ACTIONS.filter((a) => a.ranks.includes(card === 'Joker' ? 'Joker' : (card.slice(0, -1) as never)));
    assert.equal(rows.length, 1, card);
    assert.equal(heroAction(card), rows[0]);
  }
});

test('every card of a deck is exactly one dragon action', () => {
  for (const card of fullDeck()) {
    const rank = card === 'Joker' ? 'Joker' : card.slice(0, -1);
    const suit = card === 'Joker' ? null : card.slice(-1);
    const rows = DRAGON_ACTIONS.filter(
      (a) => a.ranks.includes(rank as never) && (a.suits === null || a.suits.includes(suit as never)),
    );
    assert.equal(rows.length, 1, card);
    assert.equal(dragonAction(card), rows[0]);
  }
});

test('daredevil table (rules 2.1)', () => {
  const row = (card: string) => {
    const a = heroAction(card);
    return [a.name, a.type, a.guard, a.warmup, a.damage, a.heal];
  };
  assert.deepEqual(row('A♠'), ['Intervention Dodge', 'support', true, null, null, null]);
  assert.deepEqual(row('K♥'), ['Draw Aggro', 'support', false, 1, null, null]);
  assert.deepEqual(row('Q♣'), ['Shield', 'support', true, null, null, null]);
  assert.deepEqual(row('J♥'), ['Shield', 'support', true, null, null, null]);
  assert.deepEqual(row('10♦'), ['Entangle', 'attack', false, 3, 0, null]);
  assert.deepEqual(row('9♣'), ['Charge', 'attack', false, 4, 8, null]);
  assert.deepEqual(row('8♦'), ['Precision Strike', 'attack', false, 3, 6, null]);
  assert.deepEqual(row('7♠'), ['Strike', 'attack', false, 2, 5, null]);
  assert.deepEqual(row('6♥'), ['Strike', 'attack', false, 2, 5, null]);
  assert.deepEqual(row('5♦'), ['Quick Strike', 'attack', false, 1, 5, null]);
  for (const card of ['4♥', '3♦', '2♣']) assert.deepEqual(row(card), ['Helping Hand', 'support', false, 2, null, null]);
  assert.deepEqual(row('Joker'), ['First Aid', 'support', false, 4, null, 8]);
});

test('dragon table (rules 2.2)', () => {
  const row = (card: string) => {
    const a = dragonAction(card);
    return [a.name, a.part, a.type, a.knockdown, a.warmup, a.cooldown, a.damage];
  };
  for (const card of ['A♥', 'A♦']) assert.deepEqual(row(card), ['Fire Breath', null, 'aoe', false, 2, 1, 8]);
  for (const card of ['A♠', 'A♣']) assert.deepEqual(row(card), ['Roar', null, 'special', false, 1, 1, null]);
  assert.deepEqual(row('K♠'), ['Crush', 'jaws', 'direct', false, 4, 2, 13]);
  assert.deepEqual(row('Q♥'), ['Bite', 'jaws', 'direct', false, 3, 2, 10]);
  assert.deepEqual(row('J♦'), ['Swing', 'tail', 'aoe', true, 3, 2, 6]);
  for (const card of ['10♠', '9♥']) assert.deepEqual(row(card), ['Trample', 'legs', 'direct', true, 2, 2, 8]);
  assert.deepEqual(row('8♣'), ['Heavy Strike', 'paws', 'direct', false, 3, 1, 8]);
  for (const card of ['7♣', '6♠']) assert.deepEqual(row(card), ['Strike', 'paws', 'direct', false, 2, 1, 6]);
  assert.deepEqual(row('5♣'), ['Quick Strike', 'paws', 'direct', false, 1, 1, 5]);
  assert.deepEqual(row('Joker'), ['Health Regeneration', null, 'special', false, 1, 1, null]);
  assert.equal(dragonAction('Joker').heal, 8);
});

test('glares: red turns right, black turns left; 4 is the far glare', () => {
  const glare = (card: string) => {
    const a = dragonAction(card);
    return [a.name, a.glare?.direction, a.glare?.steps, a.warmup, a.cooldown];
  };
  assert.deepEqual(glare('4♥'), ['Far Glare Right', 'right', 2, 0, 0]);
  assert.deepEqual(glare('4♦'), ['Far Glare Right', 'right', 2, 0, 0]);
  assert.deepEqual(glare('4♠'), ['Far Glare Left', 'left', 2, 0, 0]);
  assert.deepEqual(glare('4♣'), ['Far Glare Left', 'left', 2, 0, 0]);
  for (const card of ['3♥', '2♦']) assert.deepEqual(glare(card), ['Glare Right', 'right', 1, 0, 0]);
  for (const card of ['3♣', '2♠']) assert.deepEqual(glare(card), ['Glare Left', 'left', 1, 0, 0]);
});

test('dragon cards named in the sample gameplay', () => {
  const named: Record<string, string> = {
    '6♠': 'Strike', '3♥': 'Glare Right', '7♣': 'Strike', '2♦': 'Glare Right', 'Q♦': 'Bite',
    '10♠': 'Trample', 'K♠': 'Crush', '3♣': 'Glare Left', '2♣': 'Glare Left', 'A♥': 'Fire Breath',
    '5♣': 'Quick Strike', 'A♣': 'Roar', 'J♦': 'Swing', 'Joker': 'Health Regeneration',
    '4♣': 'Far Glare Left', 'Q♥': 'Bite',
  };
  for (const [card, name] of Object.entries(named)) assert.equal(dragonAction(card).name, name, card);
});

test('composition of the dragon deck', () => {
  const count = (pred: (card: string) => boolean) => fullDeck().filter(pred).length;
  assert.equal(count((c) => dragonAction(c).glare !== null), 12);
  assert.equal(count((c) => isAttack(dragonAction(c))), 38);
  assert.equal(count((c) => dragonAction(c).name === 'Roar'), 2);
  assert.equal(count((c) => dragonAction(c).name === 'Health Regeneration'), 2);
});
