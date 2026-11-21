import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BODY_PARTS } from '../src/actions.ts';
import { FINALE, FRAGMENTS, OVERTURE, TRIAL_OF_STRENGTH } from './sample/moves.ts';
import { replay } from './sample/replay.ts';

// The sample gameplay as of v1.1, after the fixes reported in #40.
for (const fragment of FRAGMENTS) {
  test(`sample gameplay, ${fragment.title}: every recorded move is legal and used`, () => {
    const { problems, defaults } = replay(fragment);
    assert.deepEqual(problems, []);
    assert.equal(defaults.length > 0, (fragment.unspecified ?? []).length > 0);
  });
}

// Spot checks of the end positions.
const hp = (r: ReturnType<typeof replay>) => ({
  heroes: r.state.heroes.map((h) => `${h.hp}${h.prone ? '↓' : ''}`),
  parts: BODY_PARTS.map((p) => `${r.state.parts[p].hp}${r.state.parts[p].entangled ? '~' : ''}`),
});

test('sample gameplay, Overture: the position after Turn 13❖', () => {
  assert.deepEqual(hp(replay(OVERTURE)), { heroes: ['25', '25', '25', '12↓'], parts: ['15', '15', '17', '25'] });
});

test('sample gameplay, Trial of Strength: the position after Turn 64❖', () => {
  const r = replay(TRIAL_OF_STRENGTH);
  assert.deepEqual(hp(r), { heroes: ['15', '16', '7', '14'], parts: ['14', '4', '4', '22'] });
  assert.deepEqual(r.state.pending, [], 'the Roar cancelled everything');
});

test('sample gameplay, Finale: victory on Turn 114', () => {
  const r = replay(FINALE);
  assert.equal(r.outcome?.result, 'victory');
  assert.equal(r.state.turn, 114);
  assert.deepEqual(hp(r), { heroes: ['0↓', '6', '8', '0↓'], parts: ['0', '0', '0', '0'] });
});
