import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dummyAgent, isValid, playConditionMet } from '../src/agents/dummy.ts';
import type { Card } from '../src/cards.ts';
import type { Decision, TurnOption } from '../src/decisions.ts';
import { runGame } from '../src/engine.ts';
import { type GameState, type HeroSetup, createGame, createGameFrom } from '../src/state.ts';

const T = 21; // seat 0's turn

/** Moves a card from the daredevils' draw pile to the top of their discard pile. */
function onDiscard(s: GameState, card: Card): void {
  s.heroDeck.drawPile.splice(s.heroDeck.drawPile.indexOf(card), 1);
  s.heroDeck.discardPile.push(card);
}

function position(hands: Card[][], discardTop?: Card, extra: Partial<HeroSetup>[] = []): GameState {
  const s = createGameFrom({}, {
    turn: T, target: null,
    heroes: hands.map((hand, i) => ({ hp: 25, hand, ...extra[i] })),
    dragon: { card: '5♠', played: T - 3, resolves: T - 2, cooldownEnds: T + 5 },
  });
  if (discardTop) onDiscard(s, discardTop);
  return s;
}

function turnOf(s: GameState, seat: number): Decision {
  const options: TurnOption[] = [...new Set(s.heroes[seat].hand)].map((card) => ({ type: 'play', card }));
  options.push({ type: 'draw' });
  return { kind: 'turn', player: seat, options };
}

/** Hands for seats 1–3 holding `k` cards in total. */
function othersHolding(k: number): Card[][] {
  const pool: Card[] = ['2♣', '3♣', '4♣', '5♣', '6♣', '7♣', '8♣', '9♣', '10♣', 'J♣', 'Q♣', 'K♣', 'A♣', '2♦', '3♦', '4♦'];
  const hands: Card[][] = [[], [], []];
  for (let i = 0; i < k; i++) hands[i % 3].push(pool[i]);
  return hands;
}

test('play condition: 0–6 same suit, 7–12 same colour, 13+ different suit, for 4 players (extensions)', () => {
  const cond = (card: Card, top: Card, held: number) => playConditionMet(position([[card], ...othersHolding(held)], top), 0, card);
  assert.equal(cond('7♥', '2♥', 6), true);
  assert.equal(cond('7♥', '5♦', 6), false);
  assert.equal(cond('7♥', '5♦', 7), true);
  assert.equal(cond('7♥', '5♠', 12), false);
  assert.equal(cond('7♥', '5♠', 13), true);
  assert.equal(cond('7♥', '2♥', 13), false);
});

test('play condition: thresholds scale with the number of other players (author, A6)', () => {
  // 6 players: n = 5, so up to 10 cards held means "same suit".
  const s = createGameFrom({}, {
    turn: T, target: null,
    heroes: [{ hp: 25, hand: ['7♥'] }, ...['2♣ 3♣', '4♣ 5♣', '6♣ 7♣', '8♣ 9♣', '10♣ J♣'].map((h) => ({ hp: 25, hand: h.split(' ') }))],
  });
  onDiscard(s, '2♦');
  assert.equal(playConditionMet(s, 0, '7♥'), false);
  s.heroes[1].hand.push('Q♣'); // 11 cards: same colour now suffices
  assert.equal(playConditionMet(s, 0, '7♥'), true);
});

test('play condition: an empty discard pile fails; Jokers (extensions; #9, #38)', () => {
  assert.equal(playConditionMet(position([['7♥'], ...othersHolding(13)]), 0, '7♥'), false);
  for (const held of [0, 7, 13]) {
    assert.equal(playConditionMet(position([['Joker'], ...othersHolding(held)], 'Joker'), 0, 'Joker'), true, `${held}`);
  }
  assert.equal(playConditionMet(position([['Joker'], ...othersHolding(6)], '2♥'), 0, 'Joker'), false);
  assert.equal(playConditionMet(position([['Joker'], ...othersHolding(12)], '2♥'), 0, 'Joker'), false);
  assert.equal(playConditionMet(position([['Joker'], ...othersHolding(13)], '2♥'), 0, 'Joker'), true);
});

test('validity: Helping Hand needs someone else on the ground, First Aid someone below 8 HP; guards always (A4)', () => {
  const s = position([['3♠', 'Joker', 'A♠', 'Q♠'], [], [], []]);
  assert.equal(isValid(s, 0, '3♠'), false);
  assert.equal(isValid(s, 0, 'Joker'), false);
  assert.equal(isValid(s, 0, 'A♠'), true);
  assert.equal(isValid(s, 0, 'Q♠'), true);
  const hurt = position([['3♠', 'Joker'], [], [], []], undefined, [{}, { prone: true, hp: 7 }]);
  assert.equal(isValid(hurt, 0, '3♠'), true);
  assert.equal(isValid(hurt, 0, 'Joker'), true);
  const out = position([['3♠'], [], [], []], undefined, [{}, { hp: 0 }]);
  assert.equal(isValid(out, 0, '3♠'), false, 'Helping Hand cannot help an incapacitated daredevil (P22)');
  const prone = position([['9♠'], [], [], []], undefined, [{ prone: true }]);
  assert.equal(isValid(prone, 0, '9♠'), false, 'no Charge on the ground');
});

test('the pile: the top card is revealed; when not played it goes to the bottom', () => {
  // Hand order is pile order, bottom first: 7♥ on top. Others hold 3 cards: same suit needed.
  const s = position([['5♥', '7♥'], ...othersHolding(3)], '2♠');
  const dummy = dummyAgent(0);
  const d = turnOf(s, 0);
  assert.deepEqual(d.options[dummy.decide(d, s)], { type: 'draw' });
  onDiscard(s, '2♥'); // 5♥ is on top now, and matches
  assert.deepEqual(d.options[dummy.decide(d, s)], { type: 'play', card: '5♥' });
});

test('cards received go on top; discards come from the bottom', () => {
  const s = position([['5♥', '7♥'], [], [], []], '2♣');
  const dummy = dummyAgent(0);
  dummy.decide(turnOf(s, 0), s); // 7♥ revealed, not played: pile 7♥ (bottom), 5♥
  s.heroes[0].hand.push('9♦'); // received: on top
  const discard: Decision = { kind: 'discard', player: 0, reason: 'hand-limit', remaining: 1, options: ['5♥', '7♥', '9♦'] };
  assert.equal(discard.options[dummy.decide(discard, s)], '7♥');
  onDiscard(s, '2♦');
  const d = turnOf(s, 0);
  assert.deepEqual(d.options[dummy.decide(d, s)], { type: 'play', card: '9♦' });
});

test('targets: the weakest body part above 0; the weakest daredevil, ties to the left', () => {
  const s = position([[], [], [], []]);
  s.parts.jaws.hp = 0;
  s.parts.paws.hp = 9;
  s.parts.legs.hp = 9;
  const dummy = dummyAgent(2);
  const parts: Decision = {
    kind: 'target', player: 2, card: '7♠', action: 'Strike',
    options: (['jaws', 'paws', 'legs', 'tail'] as const).map((part) => ({ type: 'part', part })),
  };
  assert.equal(dummy.decide(parts, s), 1); // paws (9), ahead of legs (9)
  s.heroes[0].hp = 10;
  s.heroes[1].hp = 10;
  const heroes: Decision = {
    kind: 'target', player: 2, card: 'Joker', action: 'First Aid',
    options: [0, 1, 3].map((hero) => ({ type: 'hero', hero })),
  };
  assert.equal(dummy.decide(heroes, s), 0); // from seat 2, seat 0 comes before seat 1 clockwise
});

test('Dummies at every seat: complete, deterministic games for 4–6 players', () => {
  for (const players of [4, 5, 6]) {
    for (let seed = 0; seed < 30; seed++) {
      const game = () =>
        runGame(createGame({ players, seed }), Array.from({ length: players }, (_, i) => dummyAgent(i)), { maxTurns: 2000 });
      const a = game();
      assert.notEqual(a.result, 'timeout');
      assert.deepEqual(a, game());
    }
  }
});
