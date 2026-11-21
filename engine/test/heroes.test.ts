import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { BodyPart } from '../src/actions.ts';
import type { Card } from '../src/cards.ts';
import type { Decision } from '../src/decisions.ts';
import { runGame } from '../src/engine.ts';
import type { GameEvent } from '../src/events.ts';
import { type DragonPending, type HeroPending, type HeroSetup, type Setup, createGameFrom } from '../src/state.ts';
import { agent, alwaysDraw, recorder } from './helpers.ts';

const T = 21; // daredevil turn under test: seat (T − 1) mod 4 = 0

/** A dragon card cooling down well past T, so the dragon stays idle. */
const idle: DragonPending = { card: '5♠', played: T - 3, resolves: T - 2, cooldownEnds: T + 5 };

function heroes(...hps: number[]): HeroSetup[] {
  return hps.map((hp) => ({ hp, hand: [] }));
}

function due(actor: number, card: Card, played: number, resolves = T): HeroPending {
  return { actor, card, played, resolves };
}

/**
 * Agent for these tests: aims each card at a body part or a daredevil, plays
 * `play` on its turn if it can, and otherwise deals.
 */
function scripted(aim: Record<Card, BodyPart | number>, play?: Card) {
  const decisions: Decision[] = [];
  const a = agent((d, s) => {
    decisions.push(d);
    if (d.kind === 'target' && d.card in aim) {
      const want = aim[d.card];
      const i = d.options.findIndex((o) => (o.type === 'part' ? o.part === want : o.hero === want));
      assert.ok(i >= 0, `${d.card}: ${String(want)} is not an option`);
      return i;
    }
    if (d.kind === 'turn' && play !== undefined) {
      const i = d.options.findIndex((o) => o.type === 'play' && o.card === play);
      if (i >= 0) return i;
    }
    return alwaysDraw.decide(d, s);
  });
  return { agent: a, decisions };
}

/** Plays daredevil turn T of a position (and the idle dragon turn after it), then stops. */
function heroTurn(setup: Partial<Setup> & { heroes: HeroSetup[] }, aim: Record<Card, BodyPart | number> = {}, play?: Card) {
  const s = createGameFrom({}, { turn: T, target: null, dragon: idle, ...setup });
  const rec = recorder();
  const { agent: a, decisions } = scripted(aim, play);
  const outcome = runGame(s, a, { maxTurns: setup.turn ?? T, onEvent: rec.onEvent });
  const events = rec.events.map((r) => r.event);
  const of = <K extends GameEvent['type']>(type: K) =>
    events.filter((e): e is Extract<GameEvent, { type: K }> => e.type === type);
  return { s, outcome, events, of, decisions };
}

// ---------------------------------------------------------------------------
// Attacks

test('attack: base damage to the chosen part; the attacker becomes the target if there is none', () => {
  const { s, of } = heroTurn({ heroes: heroes(25, 25, 25, 25), pending: [due(2, '7♥', T - 2)] }, { '7♥': 'tail' });
  assert.deepEqual(of('strike'), [{ type: 'strike', player: 2, card: '7♥', part: 'tail', damage: 5, hp: 20 }]);
  assert.equal(s.target, 2);
});

test('an attack does not change an existing target', () => {
  const { s } = heroTurn({ heroes: heroes(25, 25, 25, 25), target: 3, pending: [due(2, '7♥', T - 2)] }, { '7♥': 'tail' });
  assert.equal(s.target, 3);
});

test('riposte +2Ϟ on the body part that attacked, within the window only (2.1 Attack)', () => {
  const strike = (riposte: Setup['riposte'], part: BodyPart) =>
    heroTurn({ heroes: heroes(25, 25, 25, 25), pending: [due(2, '7♥', T - 2)], riposte }, { '7♥': part }).of('strike')[0].damage;
  assert.equal(strike({ part: 'jaws', from: T, to: T }, 'jaws'), 8);
  assert.equal(strike({ part: 'jaws', from: T - 1, to: T }, 'jaws'), 8);
  assert.equal(strike({ part: 'jaws', from: T, to: T }, 'paws'), 5);
  assert.equal(strike({ part: 'jaws', from: T - 1, to: T - 1 }, 'jaws'), 5);
});

test('attacker penalties at resolution: 13–1 HP −1Ϟ, on the ground −2Ϟ (2.3, 2.1)', () => {
  const strike = (hero: HeroSetup) =>
    heroTurn({ heroes: [...heroes(25, 25), hero, ...heroes(25)], pending: [due(2, '8♥', T - 3)] }, { '8♥': 'legs' })
      .of('strike')[0].damage;
  assert.equal(strike({ hp: 14, hand: [] }), 6);
  assert.equal(strike({ hp: 13, hand: [] }), 5);
  assert.equal(strike({ hp: 25, prone: true, hand: [] }), 4);
  assert.equal(strike({ hp: 1, prone: true, hand: [] }), 3);
});

test('sample Turn 62: orchestrated attack of 8♠ and 5♠, entangled Paws, Pip at 11 HP, Magnus on the ground', () => {
  const { s, of } = heroTurn(
    {
      turn: 62,
      heroes: [
        { hp: 15, hand: [] }, { hp: 16, hand: ['6♣', '2♥', '4♠'] }, { hp: 11, hand: [] }, { hp: 14, prone: true, hand: [] },
      ],
      parts: { jaws: { hp: 14 }, paws: { hp: 12, entangled: true }, legs: { hp: 8 }, tail: { hp: 22 } },
      target: 2,
      pending: [due(2, '8♠', 59, 62), due(3, '5♠', 60, 62)],
      dragon: { card: '5♣', played: 60, resolves: 62, cooldownEnds: null },
    },
    { '8♠': 'paws', '5♠': 'legs' },
    '2♥',
  );
  assert.deepEqual(of('strike').map((e) => [e.player, e.part, e.damage, e.hp]), [[2, 'paws', 8, 4], [3, 'legs', 4, 4]]);
  assert.equal(s.parts.paws.entangled, false, "removed by the dragon's Quick Strike (Paws) at 62❖");
  assert.equal(s.target, 2);
  assert.deepEqual(s.pending.map((p) => [p.card, p.resolves]), [['2♥', 64]]);
});

test('orchestrated attack: +1Ϟ per other attack of the same suit; other suits do not count (#38)', () => {
  const { of } = heroTurn(
    { heroes: heroes(25, 25, 25, 25), pending: [due(1, '7♠', T - 2), due(2, '6♠', T - 1), due(3, '5♥', T - 1)] },
    { '7♠': 'tail', '6♠': 'tail', '5♥': 'tail' },
  );
  assert.deepEqual(of('strike').map((e) => e.damage), [6, 6, 5]);
});

test('several attacks without a target: the dragon takes the one initiated last (2.1 Attack)', () => {
  const { s, of } = heroTurn(
    { heroes: heroes(25, 25, 25, 25), pending: [due(3, '9♥', T - 4), due(1, '8♦', T - 3), due(2, '7♣', T - 2)] },
    { '9♥': 'tail', '8♦': 'tail', '7♣': 'tail' },
  );
  assert.equal(s.target, 2);
  assert.deepEqual(of('target').map((e) => e.target), [3, 1, 2]);
});

test('Draw Aggro and attacks on one turn: attacks take only a missing target or one taken by an attack', () => {
  const { s } = heroTurn(
    { heroes: heroes(25, 25, 25, 25), pending: [due(3, '9♥', T - 4), due(1, 'K♦', T - 1), due(2, '7♣', T - 2)] },
    { '9♥': 'tail', '7♣': 'tail' },
  );
  // Order of initiation: 9♥ (takes the target), 7♣ (taken by an attack this turn: takes it over), K♦.
  assert.equal(s.target, 1);

  const before = heroTurn(
    { heroes: heroes(25, 25, 25, 25), pending: [due(3, '9♥', T - 4), due(1, 'K♦', T - 3), due(2, '7♣', T - 2)] },
    { '9♥': 'tail', '7♣': 'tail' },
  );
  assert.equal(before.s.target, 1, 'the attack initiated after Draw Aggro finds a target and leaves it');
});

test('the game is won as soon as the last body part reaches 0; sample Turn 114', () => {
  const { outcome, of } = heroTurn(
    {
      turn: 114,
      heroes: [{ hp: 0, hand: [] }, { hp: 6, hand: ['7♠', '5♦', '2♣'] }, { hp: 8, hand: [] }, { hp: 0, hand: [] }],
      parts: { jaws: { hp: 0 }, paws: { hp: 0 }, legs: { hp: 0 }, tail: { hp: 6 } },
      pending: [due(1, '9♥', 110, 114)],
      dragon: { card: 'Q♥', played: 108, resolves: 113, cooldownEnds: 115 },
    },
    { '9♥': 'tail' },
  );
  assert.equal(of('strike')[0].damage, 6); // Charge 8 −1Ϟ (Lirien at 6 HP)
  assert.equal(outcome.result, 'victory');
  assert.equal(outcome.turn, 114);
  assert.equal(outcome.phase, 'hero');
});

// ---------------------------------------------------------------------------
// Entangle

test('Entangle: no damage, entangles the part, takes the target (2.1, #38)', () => {
  const { s, of } = heroTurn(
    { heroes: heroes(25, 25, 25, 25), pending: [due(2, '10♥', T - 3)], riposte: { part: 'tail', from: T, to: T } },
    { '10♥': 'tail' },
  );
  assert.deepEqual(of('strike'), []);
  assert.equal(s.parts.tail.hp, 25);
  assert.equal(s.parts.tail.entangled, true);
  assert.equal(s.target, 2);
});

test('Entangle cannot target the body part of the dragon\'s attack warming up', () => {
  const { decisions } = heroTurn(
    { heroes: heroes(25, 25, 25, 25), pending: [due(2, '10♥', T - 3)], dragon: { card: 'Q♠', played: T - 1, resolves: T + 2, cooldownEnds: null } },
    { '10♥': 'paws' },
  );
  const target = decisions.find((d) => d.kind === 'target')!;
  assert.deepEqual(target.options, [{ type: 'part', part: 'paws' }, { type: 'part', part: 'legs' }, { type: 'part', part: 'tail' }]);
});

test('an entangled part: +1Ϟ for an attack resolving after the Entangle on the same turn', () => {
  const { of } = heroTurn(
    { heroes: heroes(25, 25, 25, 25), pending: [due(1, '10♥', T - 3), due(2, '7♣', T - 2)] },
    { '10♥': 'legs', '7♣': 'legs' },
  );
  assert.equal(of('strike')[0].damage, 6);
});

// ---------------------------------------------------------------------------
// Support

test('Draw Aggro: becomes the target and delays the dragon warming up; sample Turn 54', () => {
  const { s, of } = heroTurn({
    turn: 54, heroes: heroes(16, 20, 15, 14), target: 3,
    pending: [due(0, 'K♦', 53, 54)],
    dragon: { card: 'K♠', played: 50, resolves: 54, cooldownEnds: null },
  });
  assert.equal(s.target, 0);
  assert.deepEqual(of('dragon-delay'), [{ type: 'dragon-delay', card: 'K♠', resolves: 55 }]);
});

test('Draw Aggro delays attacks only, not Roar or Health Regeneration (author, #38)', () => {
  for (const card of ['A♠', 'Joker']) {
    const { s, of } = heroTurn({
      heroes: heroes(25, 25, 25, 25), pending: [due(0, 'K♦', T - 1)],
      dragon: { card, played: T - 1, resolves: T, cooldownEnds: null },
    });
    assert.equal(s.target, 0);
    assert.deepEqual(of('dragon-delay'), [], card);
  }
});

test('Draw Aggro does not move a card cooling down', () => {
  const { s, of } = heroTurn({ heroes: heroes(25, 25, 25, 25), pending: [due(0, 'K♦', T - 1)] });
  assert.equal(s.target, 0);
  assert.deepEqual(of('dragon-delay'), []);
});

test('Helping Hand: another daredevil on the ground, not incapacitated, stands up (2.1, #38)', () => {
  const down = (hp: number): HeroSetup => ({ hp, prone: true, hand: [] });
  const { s, decisions } = heroTurn(
    { heroes: [down(10), ...heroes(25), down(0), ...heroes(25)], pending: [due(1, '3♦', T - 2)] },
    { '3♦': 0 },
  );
  assert.equal(s.heroes[0].prone, false);
  assert.equal(decisions.filter((d) => d.kind === 'target').length, 0, 'one eligible daredevil: no decision');

  const nobody = heroTurn({ heroes: [down(25), ...heroes(25, 25, 25)], pending: [due(0, '3♦', T - 2)] });
  assert.deepEqual(nobody.of('no-target'), [{ type: 'no-target', player: 0, card: '3♦' }]);
});

test('First Aid: up to 8 HP, even to an incapacitated daredevil, who stands up (2.1)', () => {
  const { s, of } = heroTurn(
    { heroes: [...heroes(25), { hp: 0, hand: [] }, ...heroes(20, 25)], pending: [due(0, 'Joker', T - 4)] },
    { Joker: 1 },
  );
  assert.equal(s.heroes[1].hp, 8);
  assert.equal(s.heroes[1].prone, false);
  assert.deepEqual(of('stand-up'), [{ type: 'stand-up', player: 1, by: 0 }]);

  const capped = heroTurn({ heroes: heroes(25, 20, 25, 25), pending: [due(0, 'Joker', T - 4)] }, { Joker: 1 });
  assert.deepEqual(capped.of('heal'), [{ type: 'heal', player: 1, by: 0, amount: 5, hp: 25 }]);
});

test('First Aid and Helping Hand cannot be used on yourself', () => {
  const { decisions } = heroTurn({ heroes: heroes(10, 10, 10, 10), pending: [due(0, 'Joker', T - 4)] }, { Joker: 2 });
  const target = decisions.find((d) => d.kind === 'target')!;
  assert.deepEqual(target.options, [1, 2, 3].map((hero) => ({ type: 'hero', hero })));
});

// ---------------------------------------------------------------------------
// On the ground

test('on the ground: no guards and no base warm-up 4; others warm up +1 (2.1 On the ground)', () => {
  const hand = ['A♠', 'Q♠', '9♠', 'Joker', '7♠', '3♠'];
  const { s, decisions } = heroTurn({ heroes: [{ hp: 25, prone: true, hand }, ...heroes(25, 25, 25)] }, {}, '7♠');
  const turn = decisions.find((d) => d.kind === 'turn')!;
  assert.deepEqual(turn.options, [
    { type: 'play', card: '7♠' }, { type: 'play', card: '3♠' }, { type: 'draw' },
  ]);
  assert.deepEqual(s.pending, [{ actor: 0, card: '7♠', played: T, resolves: T + 3 }]);
});

test('helped up before resolution: no on-ground penalty at resolution, the warm-up stays (#24, #38)', () => {
  // Played on the ground at T − 3 (Strike warm-up 2 +1); helped up at T − 1.
  const { of } = heroTurn(
    { heroes: heroes(25, 25, 25, 25), pending: [due(2, '7♥', T - 3)] },
    { '7♥': 'tail' },
  );
  assert.equal(of('strike')[0].damage, 5);
});
