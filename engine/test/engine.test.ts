import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Decision } from '../src/decisions.ts';
import { play, runGame } from '../src/engine.ts';
import { type HeroSetup, type Setup, createGame, createGameFrom, handLimit } from '../src/state.ts';
import { alwaysDraw, forced, playWhenPossible, randomAgent, recorder } from './helpers.ts';

const hero = (hand: string[] = [], hp = 25): HeroSetup => ({ hp, hand });
const setup = (heroes: HeroSetup[], extra: Partial<Setup> = {}): Setup => ({ turn: 1, heroes, target: null, ...extra });
const fourEmpty = () => [hero(), hero(), hero(), hero()];

// ---------------------------------------------------------------------------
// Setting up

test('a new game (rules 1.3): full HP, 2 cards each, no target, turn 1', () => {
  const s = createGame({ players: 4, seed: 1 });
  assert.equal(s.turn, 1);
  assert.equal(s.phase, 'hero');
  assert.equal(s.target, null);
  assert.deepEqual(s.heroes.map((h) => [h.hp, h.prone, h.hand.length]), Array(4).fill([25, false, 2]));
  assert.deepEqual(Object.values(s.parts), Array(4).fill({ hp: 25, entangled: false }));
  assert.equal(s.heroDeck.drawPile.length, 54 - 8);
  assert.equal(s.dragonDeck.drawPile.length, 54);
  assert.deepEqual(createGame({ seed: 1 }).heroes, s.heroes, 'same seed, same hands');
  assert.notDeepEqual(createGame({ seed: 2 }).heroes, s.heroes);
});

test('4–6 players', () => {
  for (const players of [4, 5, 6]) assert.equal(createGame({ players }).heroes.length, players);
  for (const players of [3, 7, 4.5]) assert.throws(() => createGame({ players }), RangeError);
  assert.throws(() => createGame({ players: 4, names: ['A'] }), RangeError);
});

test('a game from a position holds every other card in its decks', () => {
  const s = createGameFrom({}, setup([hero(['9♣', '7♠']), hero(['Joker']), hero(), hero()], {
    pending: [{ actor: 2, card: 'Joker', played: 0, resolves: 2 }],
    dragon: { card: 'K♠', played: 0, resolves: 3, cooldownEnds: null },
  }));
  assert.equal(s.heroDeck.drawPile.length, 54 - 4);
  assert.equal(s.dragonDeck.drawPile.length, 53);
  assert.equal(s.heroDeck.drawPile.includes('Joker'), false);
  assert.throws(
    () => createGameFrom({}, setup([hero(['Joker', 'Joker']), hero(['Joker']), hero(), hero()])),
    /Joker appears more often/,
  );
});

test('hand limits by HP (rules 2.3)', () => {
  const limits = [25, 21, 20, 14, 13, 7, 6, 1, 0].map(handLimit);
  assert.deepEqual(limits, [6, 6, 5, 5, 4, 4, 3, 3, 0]);
});

// ---------------------------------------------------------------------------
// Timeline

/** Turn on which a card played by seat 0 on turn 1 resolves. */
function resolveTurn(players: number, card: string): number {
  const heroes = Array.from({ length: players }, (_, i) => hero(i === 0 ? [card] : []));
  const rec = recorder();
  runGame(createGameFrom({}, setup(heroes)), playWhenPossible(card, 0), { onEvent: rec.onEvent, maxTurns: 8 });
  const resolved = rec.events.find((r) => r.event.type === 'resolve');
  assert.ok(resolved, `${card} never resolved`);
  return resolved.turn;
}

test('daredevil warm-up expiry for 4 players (rules 1.5)', () => {
  assert.equal(resolveTurn(4, '5♠'), 2, '1 turn → the next daredevil');
  assert.equal(resolveTurn(4, '7♠'), 3, '2 turns → the daredevil opposite');
  assert.equal(resolveTurn(4, '8♠'), 4, '3 turns');
  assert.equal(resolveTurn(4, '9♠'), 5, "4 turns → the player's own next turn");
});

test('warm-up of 4 with 5 and 6 players expires before the own next turn', () => {
  assert.equal(resolveTurn(5, '9♠'), 5);
  assert.equal(resolveTurn(6, 'Joker'), 5);
});

test('an action expiring on the own turn resolves before the player acts', () => {
  const rec = recorder();
  runGame(createGameFrom({}, setup([hero(['9♠']), hero(), hero(), hero()])), playWhenPossible('9♠', 0), {
    onEvent: rec.onEvent, maxTurns: 5,
  });
  const atFive = rec.events.filter((r) => r.turn === 5 && r.phase === 'hero').map((r) => r.event.type);
  assert.deepEqual(atFive.slice(0, 3), ['turn', 'resolve', 'deal']);
});

test('a guard stands by until its owner\'s next turn', () => {
  const s = createGameFrom({}, setup([hero(['Q♠']), hero(), hero(), hero()]));
  const rec = recorder();
  runGame(s, playWhenPossible('Q♠', 0), { onEvent: rec.onEvent, maxTurns: 5 });
  const placed = rec.events.find((r) => r.event.type === 'play');
  assert.deepEqual([placed?.turn, placed?.event], [1, { type: 'play', player: 0, card: 'Q♠', resolves: null }]);
  const expired = rec.events.find((r) => r.event.type === 'guard-expired');
  assert.deepEqual([expired?.turn, expired?.phase], [5, 'hero']);
  assert.ok(s.heroDeck.discardPile.includes('Q♠'));
});

test('dragon warm-up and cool-down (rules 1.6)', () => {
  // Strike (7♣): warm-up 2, cool-down 1. Bite (Q♦): warm-up 3.
  const rec = recorder();
  const s = createGameFrom({}, setup(fourEmpty(), { target: 0 }));
  runGame(s, alwaysDraw, { onEvent: rec.onEvent, nextCard: forced({ dragon: ['7♣', 'Q♦'] }), maxTurns: 5 });
  const dragon = rec.events.filter((r) => r.event.type.startsWith('dragon')).map((r) => [`${r.turn}❖`, r.event]);
  assert.deepEqual(dragon, [
    ['1❖', { type: 'dragon-play', card: '7♣', resolves: 3 }],
    ['3❖', { type: 'dragon-resolve', card: '7♣', cooldownEnds: 4 }],
    ['4❖', { type: 'dragon-ready', card: '7♣' }],
    ['4❖', { type: 'dragon-play', card: 'Q♦', resolves: 7 }],
  ]);
  assert.deepEqual(s.dragonDeck.discardPile, ['7♣']);
});

test('an attack without a target is discarded and ends the dragon turn (1.6)', () => {
  const rec = recorder();
  const s = createGameFrom({}, setup(fourEmpty()));
  runGame(s, alwaysDraw, { onEvent: rec.onEvent, nextCard: forced({ dragon: ['6♠', 'A♣'] }), maxTurns: 2 });
  const dragon = rec.events.filter((r) => r.event.type.startsWith('dragon')).map((r) => [`${r.turn}❖`, r.event]);
  assert.deepEqual(dragon, [
    ['1❖', { type: 'dragon-menace', card: '6♠' }],
    ['2❖', { type: 'dragon-play', card: 'A♣', resolves: 3 }], // Roar needs no target
  ]);
});

test('cards with warm-up and cool-down 0 chain within one dragon turn', () => {
  const rec = recorder();
  const s = createGameFrom({}, setup(fourEmpty(), { target: 1 }));
  runGame(s, alwaysDraw, { onEvent: rec.onEvent, nextCard: forced({ dragon: ['3♥', '2♣', '4♦', 'Q♦'] }), maxTurns: 1 });
  const dragon = rec.events.filter((r) => r.event.type.startsWith('dragon')).map((r) => [`${r.turn}❖`, r.event.type]);
  assert.deepEqual(dragon, [
    ['1❖', 'dragon-instant'], ['1❖', 'dragon-instant'], ['1❖', 'dragon-instant'], ['1❖', 'dragon-play'],
  ]);
  assert.deepEqual(s.dragonDeck.discardPile, ['3♥', '2♣', '4♦']);
});

// ---------------------------------------------------------------------------
// Cooperative card draw and hand limits

test('dealing: one card to each fellow player, clockwise, skipping the incapacitated (1.9)', () => {
  const s = createGameFrom({}, setup([hero(), hero(), { hp: 0, hand: [] }, hero()], { turn: 2 }));
  const rec = recorder();
  const game = play(s, { onEvent: rec.onEvent, nextCard: forced({ hero: ['3♦', '5♦'] }) });
  game.next();
  const deals = rec.events.filter((r) => r.event.type === 'deal' && r.turn === 2).map((r) => r.event);
  assert.deepEqual(deals, [
    { type: 'deal', from: 1, to: 3, card: '3♦' },
    { type: 'deal', from: 1, to: 0, card: '5♦' },
  ]);
});

test('receiving a card over the limit asks for a discard', () => {
  // Seat 1 at 5 HP (limit 3) holds 3 cards and receives a fourth.
  const s = createGameFrom({}, setup([hero(), hero(['2♠', '3♠', '4♠'], 5), hero(), hero()]));
  const game = play(s, { nextCard: forced({ hero: ['K♥'] }) });
  const decision = game.next().value as Decision;
  assert.deepEqual(decision, {
    kind: 'discard', player: 1, reason: 'hand-limit', remaining: 1, options: ['2♠', '3♠', '4♠', 'K♥'],
  });
  game.next(1);
  assert.deepEqual(s.heroes[1].hand, ['2♠', '4♠', 'K♥']);
  assert.equal(s.heroDeck.discardPile.at(-1), '3♠');
});

// ---------------------------------------------------------------------------
// Decisions

test('turn options: each distinct card, then dealing', () => {
  const s = createGameFrom({}, setup([hero(['Joker', '5♠', 'Joker']), hero(), hero(), hero()]));
  const decision = play(s).next().value as Decision;
  assert.deepEqual(decision, {
    kind: 'turn', player: 0,
    options: [{ type: 'play', card: 'Joker' }, { type: 'play', card: '5♠' }, { type: 'draw' }],
  });
});

test('single-option decisions are not asked: an incapacitated player can only deal', () => {
  const s = createGameFrom({}, setup([{ hp: 0, hand: [] }, hero(['5♠']), hero(), hero()]));
  const decision = play(s).next().value as Decision;
  assert.equal(decision.player, 1, 'seat 0 dealt without being asked');
  assert.equal(s.heroes[1].hand.length, 2);
});

test('an invalid choice is rejected', () => {
  const game = play(createGameFrom({}, setup([hero(['5♠']), hero(), hero(), hero()])));
  game.next();
  assert.throws(() => game.next(2), RangeError);
});

// ---------------------------------------------------------------------------
// End of the game

test('victory when every body part is at 0, defeat when every daredevil is incapacitated (1.7)', () => {
  const parts = { jaws: { hp: 0 }, paws: { hp: 0 }, legs: { hp: 0 }, tail: { hp: 0 } };
  const won = runGame(createGameFrom({}, setup(fourEmpty(), { parts })), alwaysDraw);
  assert.equal(won.result, 'victory');
  assert.deepEqual(won.partsHp, [0, 0, 0, 0]);
  const dead = Array.from({ length: 4 }, () => ({ hp: 0, hand: [] }));
  assert.equal(runGame(createGameFrom({}, setup(dead)), alwaysDraw).result, 'defeat');
});

test('a turn limit ends the game as a timeout', () => {
  const s = createGame({ seed: 3 });
  const outcome = runGame(s, alwaysDraw, { maxTurns: 10 });
  assert.deepEqual([outcome.result, outcome.turn, outcome.phase], ['timeout', 11, 'hero']);
  assert.equal(s.outcome, outcome);
  assert.equal(play(s).next().value, outcome, 'a finished game stays finished');
});

// ---------------------------------------------------------------------------
// Determinism

function eventLog(seed: number, agentSeed: number): string {
  const rec = recorder();
  runGame(createGame({ seed }), randomAgent(agentSeed), { onEvent: rec.onEvent, maxTurns: 60 });
  return JSON.stringify(rec.events);
}

test('a game is reproducible from its seed and the choices made', () => {
  assert.equal(eventLog(7, 1), eventLog(7, 1));
  assert.notEqual(eventLog(7, 1), eventLog(8, 1));
  assert.notEqual(eventLog(7, 1), eventLog(7, 2));
});

test('the state is plain data: a copy plays out identically', () => {
  const s = createGame({ seed: 5 });
  runGame(s, randomAgent(1), { maxTurns: 20 });
  s.outcome = null;
  const copy = structuredClone(s);
  const a = runGame(s, randomAgent(2), { maxTurns: 40 });
  const b = runGame(copy, randomAgent(2), { maxTurns: 40 });
  assert.deepEqual(a, b);
  assert.deepEqual(s, copy);
});

test('every decision offered can be taken: long random games run without errors', () => {
  for (let seed = 0; seed < 50; seed++) {
    for (const players of [4, 5, 6]) {
      const s = createGame({ players, seed });
      const outcome = runGame(s, randomAgent(seed), { maxTurns: 200 });
      assert.notEqual(outcome.result, 'victory'); // daredevils deal no damage yet (#37)
      const cards = s.heroes.flatMap((h) => h.hand).length + s.heroDeck.drawPile.length +
        s.heroDeck.discardPile.length + s.pending.length + s.guards.length;
      assert.equal(cards, 54, 'no daredevil card lost or duplicated');
      const dragonCards = s.dragonDeck.drawPile.length + s.dragonDeck.discardPile.length + (s.dragon ? 1 : 0);
      assert.equal(dragonCards, 54, 'no dragon card lost or duplicated');
      for (const hero of s.heroes) {
        assert.ok(hero.hp >= 0 && hero.hp <= 25);
        if (hero.hp === 0) assert.ok(hero.prone && hero.hand.length === 0);
      }
    }
  }
});
