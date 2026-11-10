import { generateSlate } from '../src/game/fixtureGenerator';
import { CLUBS } from '../src/game/league';
import { mulberry32 } from '../src/game/rng';
import {
  accuracyOf,
  headlineFor,
  hitsOf,
  isDecided,
  outcomeFor,
  payoutFor,
  settleLegs,
} from '../src/game/settlement';
import { legsFromPicks } from '../src/game/slip';

const slate = generateSlate(CLUBS, 5);
const picks = {
  [slate.fixtures[0].id]: 0 as const,
  [slate.fixtures[1].id]: 1 as const,
  [slate.fixtures[2].id]: 2 as const,
};
const legs = legsFromPicks(slate.fixtures, picks);

describe('slip settlement', () => {
  it('settles one result per leg with a plausible score line', () => {
    const results = settleLegs(slate.fixtures, legs, mulberry32(12345));
    expect(results).toHaveLength(legs.length);
    results.forEach(r => {
      expect([0, 1, 2]).toContain(r.actual);
      expect(r.homeGoals).toBeGreaterThanOrEqual(0);
      expect(r.awayGoals).toBeGreaterThanOrEqual(0);
      if (r.actual === 1) {
        expect(r.homeGoals).toBe(r.awayGoals);
      }
      if (r.actual === 0) {
        expect(r.homeGoals).toBeGreaterThan(r.awayGoals);
      }
      if (r.actual === 2) {
        expect(r.awayGoals).toBeGreaterThan(r.homeGoals);
      }
      expect(r.hit).toBe(r.actual === r.outcome);
    });
  });

  it('is reproducible for the same seed', () => {
    const a = settleLegs(slate.fixtures, legs, mulberry32(999));
    const b = settleLegs(slate.fixtures, legs, mulberry32(999));
    expect(a.map(r => r.actual)).toEqual(b.map(r => r.actual));
  });

  it('pays only when every leg hits', () => {
    const allHit = legs.map(l => ({
      fixtureId: l.fixtureId,
      outcome: l.outcome,
      actual: l.outcome,
      hit: true,
      homeGoals: 1,
      awayGoals: 0,
      odds: 2,
    }));
    expect(payoutFor(100, legs, null, allHit)).toBeGreaterThan(0);
    const oneMiss = allHit.slice();
    oneMiss[1] = { ...oneMiss[1], hit: false };
    expect(payoutFor(100, legs, null, oneMiss)).toBe(0);
    expect(isDecided(oneMiss)).toBe(true);
    expect(hitsOf(oneMiss)).toBe(2);
    expect(accuracyOf(oneMiss)).toBeCloseTo(2 / 3, 6);
  });

  it('names the outcome in the words of the game', () => {
    expect(headlineFor('landed')).toBe('SLIP LANDED');
    expect(headlineFor('banker')).toBe('BANKER SAVED IT');
    expect(headlineFor('busted')).toBe('SLIP BUSTED');
    expect(headlineFor('cashed')).toBe('CASHED OUT');
    const all = legs.map(l => ({
      fixtureId: l.fixtureId,
      outcome: l.outcome,
      actual: l.outcome,
      hit: true,
      homeGoals: 1,
      awayGoals: 0,
      odds: 2,
    }));
    expect(outcomeFor(all, null, false)).toBe('landed');
    expect(outcomeFor(all, all[0].fixtureId, false)).toBe('banker');
    expect(outcomeFor(all, null, true)).toBe('cashed');
  });
});
