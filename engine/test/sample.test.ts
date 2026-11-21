import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BODY_PARTS } from '../src/actions.ts';
import { FINALE, FRAGMENTS, type Fragment, OVERTURE, TRIAL_OF_STRENGTH } from './sample/moves.ts';
import { replay } from './sample/replay.ts';

/**
 * Discrepancies between the sample gameplay and the rules, known and reported
 * (#40). Turn 105: Gorrak plays 5♣ as a Strike (warm-up 2, +1 on the ground,
 * placed at Turn 108); by 2.1 a 5 is a Quick Strike (warm-up 1), so it
 * resolves at Turn 107, before the record has a target for it.
 */
const KNOWN: Record<string, string[]> = {
  Finale: ["107: no target recorded for Gorrak's 5♣"],
};

for (const fragment of FRAGMENTS) {
  test(`sample gameplay, ${fragment.title}: every recorded move is legal and used`, () => {
    const { problems, defaults } = replay(fragment);
    assert.deepEqual(problems, KNOWN[fragment.title] ?? []);
    if (!KNOWN[fragment.title]) assert.equal(defaults.length > 0, (fragment.unspecified ?? []).length > 0);
  });
}

/** The Finale with Gorrak's 5♣ replaced by a card the rules make a Strike. */
const FINALE_WITH_STRIKE: Fragment = JSON.parse(JSON.stringify(FINALE).replaceAll('5♣', '7♣'));

// Spot checks of the end positions; the full turn-by-turn comparison with the
// markdown is the validator's job (#40).
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

test('sample gameplay, Finale with a Strike in place of 5♣: the rest is consistent, victory on Turn 114', () => {
  const r = replay(FINALE_WITH_STRIKE);
  assert.deepEqual(r.problems, []);
  assert.equal(r.outcome?.result, 'victory');
  assert.deepEqual(hp(r), { heroes: ['0↓', '6', '8', '0↓'], parts: ['0', '0', '0', '0'] });
});
