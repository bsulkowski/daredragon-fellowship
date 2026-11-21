import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Card } from '../src/cards.ts';
import type { Agent } from '../src/decisions.ts';
import { runGame } from '../src/engine.ts';
import type { GameEvent } from '../src/events.ts';
import { type GameConfig, type GuardPending, type HeroSetup, type Setup, createGameFrom } from '../src/state.ts';
import { alwaysDraw, forced, recorder } from './helpers.ts';

const T = 20; // the dragon turn under test; seat (T − 1) mod 4 = 3 had the previous turn

function heroes(...hps: number[]): HeroSetup[] {
  return hps.map((hp) => ({ hp, hand: [] }));
}

function guard(actor: number, card: Card, placed = T - 1): GuardPending {
  return { actor, card, placed, expires: placed + 4 };
}

/** The dragon's card resolving at T❖. */
function resolving(card: Card, played = T - 2) {
  return { card, played, resolves: T, cooldownEnds: null };
}

/** Plays dragon turn T❖ of a position and stops. */
function dragonTurn(setup: Setup, options: { config?: Partial<GameConfig>; dragon?: Card[]; agent?: Agent } = {}) {
  const s = createGameFrom(options.config ?? {}, setup);
  s.phase = 'dragon';
  const rec = recorder();
  const outcome = runGame(s, options.agent ?? alwaysDraw, {
    maxTurns: setup.turn, onEvent: rec.onEvent, nextCard: forced({ dragon: options.dragon }),
  });
  const events = rec.events.map((r) => r.event);
  const of = <K extends GameEvent['type']>(type: K) =>
    events.filter((e): e is Extract<GameEvent, { type: K }> => e.type === type);
  return { s, outcome, events, of };
}

// ---------------------------------------------------------------------------
// Direct attack

test('direct attack: base damage, riposte window, cool-down (2.2, 2.1 Attack)', () => {
  const { s, of } = dragonTurn({ turn: T, heroes: heroes(25, 25, 25, 25), target: 1, dragon: resolving('Q♠') });
  assert.equal(s.heroes[1].hp, 15); // Bite 10
  assert.equal(s.heroes[1].prone, false);
  assert.deepEqual(s.riposte, { part: 'jaws', from: T + 1, to: T + 1 });
  assert.equal(s.dragon!.cooldownEnds, T + 2);
  assert.deepEqual(of('hit'), [{ type: 'hit', player: 1, damage: 10, hp: 15 }]);
});

test('direct attack on a target warming up: +1Ϟ and knockdown cancelling the action', () => {
  const { s, of } = dragonTurn({
    turn: T, heroes: heroes(25, 25, 25, 25), target: 1, dragon: resolving('Q♠'),
    pending: [{ actor: 1, card: '9♥', played: T - 1, resolves: T + 3 }],
  });
  assert.equal(s.heroes[1].hp, 12); // Bite 10 +1Ϟ = 13
  assert.equal(s.heroes[1].prone, true);
  assert.deepEqual(s.pending, []);
  assert.deepEqual(s.heroDeck.discardPile, ['9♥']);
  assert.deepEqual(of('cancel'), [{ type: 'cancel', player: 1, card: '9♥', reason: 'knockdown' }]);
});

test('direct attack on a target on the ground: +2Ϟ; sample Turn 113❖ (Bite, Jaws at 0)', () => {
  const { s } = dragonTurn({
    turn: T, heroes: [{ hp: 3, prone: true, hand: [] }, ...heroes(6, 8, 0)], target: 0,
    parts: { jaws: { hp: 0 }, paws: { hp: 0 }, legs: { hp: 0 }, tail: { hp: 6 } }, dragon: resolving('Q♥'),
  });
  // 10 −2Ϟ (Jaws at 0) +2Ϟ (on the ground) = 10
  assert.equal(s.heroes[0].hp, 0);
  assert.equal(s.target, null);
});

test('inherent knockdown (Trample)', () => {
  const { s } = dragonTurn({ turn: T, heroes: heroes(25, 25, 25, 25), target: 2, dragon: resolving('9♣') });
  assert.equal(s.heroes[2].hp, 17);
  assert.equal(s.heroes[2].prone, true);
});

test('damage modifiers: more than 4 players, difficulty, body-part HP (2.2, 3.1, 2.3)', () => {
  const strike = (players: number, dragonModifier: number, paws: number) =>
    dragonTurn(
      { turn: T, heroes: heroes(...Array(players).fill(25)), target: 0, parts: { paws: { hp: paws } }, dragon: resolving('7♠') },
      { config: { dragonModifier } },
    ).of('hit')[0].damage;
  assert.equal(strike(4, 0, 25), 6);
  assert.equal(strike(5, 0, 25), 8);
  assert.equal(strike(6, 0, 25), 8);
  assert.equal(strike(4, 1, 25), 8);
  assert.equal(strike(4, -1, 25), 5);
  assert.equal(strike(4, 0, 13), 5);
  assert.equal(strike(4, 0, 0), 4);
  assert.equal(strike(5, 2, 0), 8); // +1 +2 −2 = +1
  assert.equal(strike(4, 20, 25), 25); // clamped to the end of the dracometer
});

test('hand limit after damage: excess cards are discarded by choice (1.9, 2.3)', () => {
  const hand = ['2♠', '3♠', '4♠', '5♠', '6♠', '7♠'];
  const { s, of } = dragonTurn({
    turn: T, heroes: [{ hp: 25, hand }, ...heroes(25, 25, 25)], target: 0, dragon: resolving('Q♠'),
  });
  assert.equal(s.heroes[0].hp, 15);
  assert.equal(s.heroes[0].hand.length, 5);
  assert.deepEqual(of('discard').map((e) => e.reason), ['hand-limit']);
});

test('incapacitation: hand discarded, actions cancelled, on the ground, no longer the target (2.3)', () => {
  const { s, of } = dragonTurn({
    turn: T, heroes: [{ hp: 10, hand: ['2♠', '3♠'] }, ...heroes(25, 25, 25)], target: 0, dragon: resolving('Q♠'),
    pending: [{ actor: 0, card: '7♥', played: T - 1, resolves: T + 1 }],
  });
  assert.equal(s.heroes[0].hp, 0); // 10 +1Ϟ = 13
  assert.equal(s.heroes[0].prone, true);
  assert.deepEqual(s.heroes[0].hand, []);
  assert.deepEqual(s.pending, []);
  assert.equal(s.target, null);
  assert.deepEqual(of('cancel').map((e) => e.reason), ['incapacitated']);
  assert.deepEqual(of('target'), [{ type: 'target', target: null }]);
});

// ---------------------------------------------------------------------------
// Guards against a direct attack

test('Shield vs Direct Attack: −3Ϟ per shield, the last shielder takes it, no warm-up knockdown (2.1)', () => {
  const { s, of } = dragonTurn({
    turn: T, heroes: heroes(25, 25, 25, 25), target: 1, dragon: resolving('Q♠'),
    pending: [{ actor: 1, card: '9♥', played: T - 2, resolves: T + 2 }],
    guards: [guard(2, 'Q♥', T - 3), guard(3, 'J♣', T - 1)],
  });
  // Bite 10 +1Ϟ (target warming up) −6Ϟ = 3, taken by the last shielder
  assert.deepEqual(of('hit'), [{ type: 'hit', player: 3, damage: 3, hp: 22 }]);
  assert.equal(s.heroes[1].prone, false);
  assert.equal(s.pending.length, 1, "the target's action is not cancelled");
  assert.equal(s.heroes[3].prone, false);
  assert.deepEqual(s.guards, []);
  assert.deepEqual(of('guard').map((e) => e.player), [2, 3]);
});

test("Shield vs Direct Attack: the shielder takes the attack's inherent knockdown", () => {
  const { s } = dragonTurn({
    turn: T, heroes: heroes(25, 25, 25, 25), target: 1, dragon: resolving('10♦'), guards: [guard(2, 'Q♥')],
  });
  assert.equal(s.heroes[2].hp, 21); // Trample 8 −3Ϟ = 4
  assert.equal(s.heroes[2].prone, true);
  assert.equal(s.heroes[1].prone, false);
});

test("a shielder who is the target is not shielded and the Shield keeps waiting (author, #38)", () => {
  const { s } = dragonTurn({
    turn: T, heroes: heroes(25, 25, 25, 25), target: 1, dragon: resolving('Q♠'), guards: [guard(1, 'Q♥')],
  });
  assert.equal(s.heroes[1].hp, 15);
  assert.equal(s.guards.length, 1);
});

test('Intervention Dodge: knockdown instead of damage, the dragon loses its balance (2.1)', () => {
  const { s, of } = dragonTurn({
    turn: T, heroes: heroes(25, 25, 25, 25), target: 1, dragon: resolving('Q♠'),
    pending: [{ actor: 1, card: '9♥', played: T - 2, resolves: T + 2 }],
    guards: [guard(0, 'Q♥', T - 3), guard(2, 'A♦', T - 1)],
  });
  assert.deepEqual(of('hit'), []);
  assert.equal(s.heroes[1].hp, 25);
  assert.equal(s.heroes[1].prone, true);
  assert.deepEqual(s.pending, [], 'being knocked to the ground cancels the action (author, #38)');
  assert.equal(s.dragon!.cooldownEnds, T + 3); // Bite cool-down 2 +1
  assert.deepEqual(s.riposte, { part: 'jaws', from: T + 1, to: T + 2 });
  assert.deepEqual(s.guards.map((g) => g.card), ['Q♥'], 'the Shield played earlier keeps waiting (author, #38)');
});

test('competing guards: the one played last wins (author, #38)', () => {
  const shieldLast = dragonTurn({
    turn: T, heroes: heroes(25, 25, 25, 25), target: 1, dragon: resolving('Q♠'),
    guards: [guard(0, 'A♦', T - 3), guard(2, 'Q♥', T - 1)],
  });
  assert.deepEqual(shieldLast.of('hit'), [{ type: 'hit', player: 2, damage: 5, hp: 20 }]); // 10 −3Ϟ
  assert.equal(shieldLast.s.heroes[1].prone, false);
  assert.equal(shieldLast.s.dragon!.cooldownEnds, T + 2);
  assert.deepEqual(shieldLast.s.guards.map((g) => g.card), ['A♦'], 'the Dodge keeps waiting');

  const twoDodges = dragonTurn({
    turn: T, heroes: heroes(25, 25, 25, 25), target: 1, dragon: resolving('Q♠'),
    guards: [guard(0, 'A♦', T - 3), guard(2, 'A♣', T - 1)],
  });
  assert.deepEqual(twoDodges.of('guard').map((e) => e.player), [2]);
  assert.deepEqual(twoDodges.s.guards.map((g) => g.card), ['A♦']);
});

test('sample Turn 8❖: Pip dodges for Magnus; cool-down 2→3, riposte on Turns 9 and 10', () => {
  const { s } = dragonTurn({
    turn: 8, heroes: heroes(25, 25, 25, 25), target: 3, dragon: { card: 'Q♦', played: 5, resolves: 8, cooldownEnds: null },
    guards: [guard(2, 'A♦', 7)],
  });
  assert.equal(s.heroes[3].prone, true);
  assert.equal(s.dragon!.cooldownEnds, 11);
  assert.deepEqual(s.riposte, { part: 'jaws', from: 9, to: 10 });
});

test('Intervention Dodge cannot save its own player or a target on the ground; it keeps waiting', () => {
  const own = dragonTurn({
    turn: T, heroes: heroes(25, 25, 25, 25), target: 1, dragon: resolving('Q♠'), guards: [guard(1, 'A♦')],
  });
  assert.equal(own.s.heroes[1].hp, 15);
  assert.equal(own.s.guards.length, 1);

  const prone = dragonTurn({
    turn: T, heroes: [...heroes(25), { hp: 25, prone: true, hand: [] }, ...heroes(25, 25)], target: 1,
    dragon: resolving('Q♠'), guards: [guard(0, 'A♦')],
  });
  assert.equal(prone.s.heroes[1].hp, 9); // 10 +2Ϟ = 16
  assert.equal(prone.s.guards.length, 1);
});

// ---------------------------------------------------------------------------
// AoE attack

test('Shield vs AoE Attack: the example of 2.1 (A 1, B 1, C 4, D 1)', () => {
  // Fire Breath (8) on B hits A, B and C; C and D shield.
  const { s, of } = dragonTurn({
    turn: T, heroes: heroes(25, 25, 25, 25), target: 1, dragon: resolving('A♥'),
    guards: [guard(2, 'Q♥'), guard(3, 'J♣')],
  });
  assert.deepEqual(of('hit').map((e) => [e.player, e.damage]), [[0, 1], [1, 1], [2, 4], [3, 1]]);
  assert.deepEqual(s.guards, []);
  assert.equal(s.riposte, null, 'Fire Breath uses no body part');
});

test('sample Turn 104❖: Swing on Magnus, Pip on the ground, Magnus shields (2.2, 2.1)', () => {
  const { s, of } = dragonTurn({
    turn: 104,
    heroes: [{ hp: 5, hand: [] }, { hp: 6, hand: [] }, { hp: 0, prone: true, hand: [] }, { hp: 3, hand: ['6♠', '9♦'] }],
    parts: { jaws: { hp: 2 }, paws: { hp: 0 }, legs: { hp: 0 }, tail: { hp: 6 } },
    target: 3,
    dragon: { card: 'J♦', played: 101, resolves: 104, cooldownEnds: null },
    guards: [{ actor: 3, card: 'Q♣', placed: 104, expires: 108 }],
    pending: [{ actor: 1, card: 'Joker', played: 102, resolves: 106 }],
  });
  // Tail at 6: Swing 6 −1Ϟ = 5. Gorrak shielded: 2. Magnus not: 5.
  assert.deepEqual(of('hit').map((e) => [e.player, e.damage]), [[3, 5], [0, 2]]);
  assert.equal(s.heroes[0].hp, 3);
  assert.equal(s.heroes[0].prone, true);
  assert.equal(s.heroes[2].hp, 0, 'Pip on the ground is unaffected');
  assert.equal(s.heroes[3].hp, 0);
  assert.equal(s.target, null);
  assert.equal(s.dragon!.cooldownEnds, 106);
  assert.equal(s.pending.length, 1, "Lirien's First Aid is untouched");
  assert.deepEqual(s.riposte, { part: 'tail', from: 105, to: 105 });
});

test('AoE: Intervention Dodge does not work and keeps waiting (A15)', () => {
  const { s, of } = dragonTurn({
    turn: T, heroes: heroes(25, 25, 25, 25), target: 1, dragon: resolving('J♠'), guards: [guard(3, 'A♣')],
  });
  assert.deepEqual(of('hit').map((e) => [e.player, e.damage]), [[0, 6], [1, 6], [2, 6]]);
  assert.equal(s.guards.length, 1, 'the Dodge stays for a direct attack');
  assert.equal(s.dragon!.cooldownEnds, T + 2, 'no loss of balance');
  assert.deepEqual(s.riposte, { part: 'tail', from: T + 1, to: T + 1 });
});

test('AoE: Shields wait when nobody in the area is to be hit (A16)', () => {
  const down = { hp: 25, prone: true, hand: [] };
  const { s, of } = dragonTurn({
    turn: T, heroes: [down, down, down, { hp: 25, hand: [] }], target: 1, dragon: resolving('A♥'),
    guards: [guard(3, 'Q♥')],
  });
  assert.deepEqual(of('hit'), []);
  assert.equal(s.guards.length, 1);
});

// ---------------------------------------------------------------------------
// Special actions

test('Roar: cancels every action on the board, each player discards 2 of their choice (2.2)', () => {
  const { s, of } = dragonTurn({
    turn: T,
    heroes: [
      { hp: 25, hand: ['2♠', '3♠', '4♠'] }, { hp: 25, hand: ['5♠'] }, { hp: 25, hand: [] }, { hp: 25, hand: ['6♠', '7♠'] },
    ],
    target: null, dragon: resolving('A♠'),
    pending: [{ actor: 0, card: '9♥', played: T - 1, resolves: T + 3 }],
    guards: [guard(2, 'Q♥')],
  });
  assert.deepEqual(of('cancel').map((e) => [e.player, e.reason]), [[0, 'roar'], [2, 'roar']]);
  assert.deepEqual(s.pending, []);
  assert.deepEqual(s.guards, []);
  assert.deepEqual(s.heroes.map((h) => h.hand.length), [1, 0, 0, 0]);
  assert.equal(of('discard').length, 5);
});

test('Health Regeneration: the weakest part, ties jaws → tail; sample Turn 107❖ (2.2)', () => {
  const sample = dragonTurn({
    turn: 107, heroes: heroes(3, 6, 0, 0), target: null,
    parts: { jaws: { hp: 2 }, paws: { hp: 0 }, legs: { hp: 0 }, tail: { hp: 6 } },
    dragon: { card: 'Joker', played: 106, resolves: 107, cooldownEnds: null },
  });
  assert.equal(sample.s.parts.paws.hp, 8);
  assert.deepEqual(sample.of('regenerate'), [{ type: 'regenerate', part: 'paws', amount: 8, hp: 8 }]);

  const capped = dragonTurn({
    turn: T, heroes: heroes(25, 25, 25, 25), target: null,
    parts: { jaws: { hp: 20 }, paws: { hp: 20 }, legs: { hp: 22 }, tail: { hp: 20 } }, dragon: resolving('Joker'),
  });
  assert.equal(capped.s.parts.jaws.hp, 25);
  assert.equal(capped.s.parts.paws.hp, 20);
});

// ---------------------------------------------------------------------------
// Glare

/** Target after the dragon, ready at turn `turn`❖, plays `card`. */
function glareFrom(target: number | null, card: Card, turn = T, hps = [25, 25, 25, 25]) {
  // Quick Strike follows so that the dragon has something to place.
  const { s } = dragonTurn({ turn, heroes: heroes(...hps), target }, { dragon: [card, '5♠'] });
  return s.target;
}

test('Glare examples of 2.2 for 4 players (target B)', () => {
  const [A, B, C, D] = [0, 1, 2, 3];
  assert.equal(glareFrom(B, '2♠'), A); // Glare Left
  assert.equal(glareFrom(B, '3♥'), C); // Glare Right
  assert.equal(glareFrom(B, '4♥'), D); // Far Glare Right
  assert.equal(glareFrom(B, '4♣'), D); // Far Glare Left
});

test('Glare without a target starts between the previous daredevil and the next (2.2)', () => {
  // Dragon turn 2❖ follows daredevil B's turn 2.
  assert.equal(glareFrom(null, '3♠', 2), 1); // Glare Left → B
  assert.equal(glareFrom(null, '2♦', 2), 2); // Glare Right → C
  assert.equal(glareFrom(null, '4♠', 2), 0); // Far Glare Left → A
  assert.equal(glareFrom(null, '4♦', 2), 3); // Far Glare Right → D
});

test('Glare skips incapacitated daredevils; sample Turn 108❖ (Far Glare Left from Gorrak)', () => {
  assert.equal(glareFrom(0, '4♣', 108, [3, 6, 8, 0]), 1); // Magnus skipped → Pip → Lirien
  assert.equal(glareFrom(null, '3♠', 4, [25, 25, 25, 0]), 2); // previous turn D's, D incapacitated → C
  assert.equal(glareFrom(null, '3♥', 4, [0, 25, 25, 0]), 1); // A and D incapacitated → B
});

test('Glares chain within one dragon turn, then the next card is placed (1.6)', () => {
  const { s, of } = dragonTurn({ turn: T, heroes: heroes(25, 25, 25, 25), target: 1 }, { dragon: ['2♠', '2♣', '5♠'] });
  assert.deepEqual(of('target'), [{ type: 'target', target: 0 }, { type: 'target', target: 3 }]);
  assert.equal(s.dragon!.card, '5♠');
});

// ---------------------------------------------------------------------------
// Warm-up of the dragon's action

test('warm-up +1 for an entangled body part and +1 at 0 HP, set when placed; sample Turn 108❖', () => {
  const { s } = dragonTurn(
    { turn: 108, heroes: heroes(3, 6, 8, 0), target: 0, parts: { jaws: { hp: 0 } } },
    { dragon: ['4♣', 'Q♥'] },
  );
  assert.equal(s.dragon!.resolves, 112); // Bite 3 +1

  const both = dragonTurn(
    { turn: T, heroes: heroes(25, 25, 25, 25), target: 0, parts: { jaws: { hp: 0, entangled: true } } },
    { dragon: ['Q♥'] },
  );
  assert.equal(both.s.dragon!.resolves, T + 5);
  assert.equal(both.s.parts.jaws.entangled, true, 'the entanglement stays until the attack resolves');
});

test('the entanglement is removed when the attack resolves (2.1 Entangle)', () => {
  const { s } = dragonTurn({
    turn: T, heroes: heroes(25, 25, 25, 25), target: 0, parts: { jaws: { hp: 25, entangled: true } }, dragon: resolving('Q♥'),
  });
  assert.equal(s.parts.jaws.entangled, false);
  assert.equal(s.heroes[0].hp, 15, 'the entanglement does not change the dragon\'s damage');
});
