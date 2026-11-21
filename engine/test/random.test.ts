import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng, nextFloat, nextInt, nextUint32, shuffle } from '../src/random.ts';

const take = (seed: number, n: number) => {
  const rng = createRng(seed);
  return Array.from({ length: n }, () => nextUint32(rng));
};

test('the same seed gives the same stream', () => {
  assert.deepEqual(take(42, 100), take(42, 100));
});

test('different seeds, including neighbouring ones, give different streams', () => {
  const streams = [0, 1, 2, 3, 42, -1, 2 ** 31].map((seed) => take(seed, 8).join());
  assert.equal(new Set(streams).size, streams.length);
});

test('the state is plain data: a copy continues identically', () => {
  const rng = createRng(7);
  for (let i = 0; i < 10; i++) nextUint32(rng);
  const copy = structuredClone(rng);
  assert.deepEqual(
    Array.from({ length: 20 }, () => nextUint32(rng)),
    Array.from({ length: 20 }, () => nextUint32(copy)),
  );
});

test('seeds must be integers', () => {
  assert.throws(() => createRng(1.5), RangeError);
});

test('nextFloat stays in [0, 1)', () => {
  const rng = createRng(3);
  for (let i = 0; i < 10_000; i++) {
    const x = nextFloat(rng);
    assert.ok(x >= 0 && x < 1);
  }
});

test('nextInt is in range and roughly uniform', () => {
  const rng = createRng(11);
  const n = 6;
  const draws = 60_000;
  const counts = new Array(n).fill(0);
  for (let i = 0; i < draws; i++) counts[nextInt(rng, n)]++;
  // Chi-square with 5 degrees of freedom; 20.5 is the 0.999 quantile.
  const expected = draws / n;
  const chi2 = counts.reduce((sum, c) => sum + (c - expected) ** 2 / expected, 0);
  assert.ok(chi2 < 20.5, `chi-square ${chi2.toFixed(1)}, counts ${counts}`);
  assert.throws(() => nextInt(rng, 0), RangeError);
  assert.throws(() => nextInt(rng, 2.5), RangeError);
  assert.equal(nextInt(rng, 1), 0);
});

test('shuffle permutes in place, deterministically', () => {
  const items = Array.from({ length: 54 }, (_, i) => i);
  const a = shuffle(createRng(5), [...items]);
  const b = shuffle(createRng(5), [...items]);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, items);
  assert.deepEqual([...a].sort((x, y) => x - y), items);
  const same = [1, 2, 3];
  assert.equal(shuffle(createRng(1), same), same);
});
