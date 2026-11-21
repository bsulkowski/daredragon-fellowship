import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DRACOMETER, MAX_POSITION, modify, position, valueAt } from '../src/dracometer.ts';

test('the scale from rules 1.10', () => {
  assert.deepEqual(DRACOMETER, [0, 1, 2, 3, 4, 5, 6, 8, 10, 13, 16, 20, 25]);
  assert.equal(MAX_POSITION, 12);
});

test('rules 1.10 example: base 8 with +1Ϟ, +2Ϟ, +3Ϟ gives 10, 13, 16', () => {
  assert.equal(modify(8, 1), 10);
  assert.equal(modify(8, 2), 13);
  assert.equal(modify(8, 3), 16);
});

test('worked examples from the sample gameplay', () => {
  assert.equal(modify(6, -3), 3, 'Turn 4❖: Paws Strike 6 against one Shield');
  assert.equal(modify(13, -6), 3, 'Turn 55❖: Crush 13 against two Shields');
  assert.equal(modify(8, -6), 1, 'Turn 59❖: Fire Breath 8 against two Shields');
  assert.equal(modify(6, 2), 10, 'Turn 9: Precision Strike 6 with riposte');
  assert.equal(modify(5, -3), 2, 'Turn 108: Strike 5, HP 13–1 and on the ground');
});

test('positions and values round-trip', () => {
  DRACOMETER.forEach((value, pos) => {
    assert.equal(position(value), pos);
    assert.equal(valueAt(pos), value);
  });
});

test('values off the scale are rejected', () => {
  for (const value of [7, 9, 11, 26, -1]) assert.throws(() => position(value), RangeError);
  assert.throws(() => valueAt(1.5), RangeError);
});

test('modifiers clamp at both ends of the scale', () => {
  assert.equal(modify(5, -9), 0);
  assert.equal(modify(20, 5), 25);
  assert.equal(modify(0, 0), 0);
  assert.equal(modify(0, 2), 2);
});
