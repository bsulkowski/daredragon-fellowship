// Seeded randomness. The generator state is a plain object, so it can live
// inside a game state and be copied with it: the same seed always gives the
// same game.
//
// Generator: SFC32 (Chris Doty-Humphrey's Small Fast Counting generator),
// seeded through SplitMix32 so that neighbouring seeds give unrelated streams.

export interface Rng {
  a: number;
  b: number;
  c: number;
  d: number;
}

function splitmix32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x9e3779b9) >>> 0;
    let z = state;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b);
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35);
    return (z ^ (z >>> 16)) >>> 0;
  };
}

/** A generator for a seed. Any integer seed works; it is taken modulo 2^32. */
export function createRng(seed: number): Rng {
  if (!Number.isInteger(seed)) throw new RangeError(`seed must be an integer, got ${seed}`);
  const next = splitmix32(seed);
  const rng: Rng = { a: next(), b: next(), c: next(), d: next() };
  for (let i = 0; i < 12; i++) nextUint32(rng); // warm up the state
  return rng;
}

/** Next 32-bit unsigned integer; advances the state. */
export function nextUint32(rng: Rng): number {
  const t = (((rng.a + rng.b) >>> 0) + rng.d) >>> 0;
  rng.d = (rng.d + 1) >>> 0;
  rng.a = rng.b ^ (rng.b >>> 9);
  rng.b = (rng.c + (rng.c << 3)) >>> 0;
  rng.c = ((rng.c << 21) | (rng.c >>> 11)) >>> 0;
  rng.c = (rng.c + t) >>> 0;
  return t;
}

/** Uniform float in [0, 1). */
export function nextFloat(rng: Rng): number {
  return nextUint32(rng) / 0x1_0000_0000;
}

/** Uniform integer in [0, n), without modulo bias. */
export function nextInt(rng: Rng, n: number): number {
  if (!Number.isInteger(n) || n <= 0 || n > 0x1_0000_0000) throw new RangeError(`bad range ${n}`);
  const limit = 0x1_0000_0000 - (0x1_0000_0000 % n);
  let x: number;
  do x = nextUint32(rng);
  while (x >= limit);
  return x % n;
}

/** Shuffles an array in place (Fisher–Yates) and returns it. */
export function shuffle<T>(rng: Rng, items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = nextInt(rng, i + 1);
    const tmp = items[i];
    items[i] = items[j];
    items[j] = tmp;
  }
  return items;
}
