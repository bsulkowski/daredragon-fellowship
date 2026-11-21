// The dracometer (rules 1.10): every damage value lies on this fixed scale,
// and every damage modifier is a number of steps along it.

export const DRACOMETER: readonly number[] = [0, 1, 2, 3, 4, 5, 6, 8, 10, 13, 16, 20, 25];

/** The highest position on the scale (value 25). */
export const MAX_POSITION = DRACOMETER.length - 1;

/** Position of a value on the scale. Throws if the value is not on the scale. */
export function position(value: number): number {
  const index = DRACOMETER.indexOf(value);
  if (index < 0) throw new RangeError(`${value} is not a dracometer value`);
  return index;
}

/** Value at a position, clamped to the ends of the scale (0 and 25). */
export function valueAt(pos: number): number {
  if (!Number.isInteger(pos)) throw new RangeError(`position must be an integer, got ${pos}`);
  return DRACOMETER[Math.min(MAX_POSITION, Math.max(0, pos))];
}

/**
 * Applies a total modifier, in Ϟ steps, to a base damage value.
 *
 * Callers sum all modifiers first and clamp once. The rules do not say whether
 * intermediate results clamp (e.g. 5 −3Ϟ −3Ϟ +2Ϟ gives 1 summed, 2 step by step);
 * summing is the provisional reading, recorded in the ambiguity register.
 */
export function modify(base: number, steps: number): number {
  return valueAt(position(base) + steps);
}
