import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomAgent } from '../src/agents/random.ts';
import type { Decision } from '../src/decisions.ts';
import { runGame } from '../src/engine.ts';
import { createGame } from '../src/state.ts';

const turn: Decision = {
  kind: 'turn', player: 0,
  options: [{ type: 'play', card: '2♠' }, { type: 'play', card: '3♠' }, { type: 'play', card: '4♠' }, { type: 'draw' }],
};

function drawShare(variant: 'a' | 'b'): number {
  const agent = randomAgent(7, variant);
  let draws = 0;
  for (let i = 0; i < 4000; i++) if (agent.decide(turn, createGame()) === 3) draws++;
  return draws / 4000;
}

test('random (a): every legal option equally likely — dealing 1 in 4 here', () => {
  assert.ok(Math.abs(drawShare('a') - 0.25) < 0.03);
});

test('random (b): play or deal first, half and half, then the card', () => {
  assert.ok(Math.abs(drawShare('b') - 0.5) < 0.03);
});

test('random (b) deals when it has nothing to play', () => {
  const agent = randomAgent(1, 'b');
  for (let i = 0; i < 50; i++) assert.equal(agent.decide({ kind: 'turn', player: 0, options: [{ type: 'draw' }] }, createGame()), 0);
});

test('random agents: a game is reproducible from the game seed and the agent seed', () => {
  for (const variant of ['a', 'b'] as const) {
    const a = runGame(createGame({ seed: 5 }), randomAgent(9, variant), { maxTurns: 1000 });
    const b = runGame(createGame({ seed: 5 }), randomAgent(9, variant), { maxTurns: 1000 });
    assert.deepEqual(a, b);
  }
});
