import { FIXTURES_PER_SLATE } from '../src/constants/config';
import { generateSlate, isSolvableSlate } from '../src/game/fixtureGenerator';
import { CLUBS } from '../src/game/league';
import { seedFor } from '../src/game/rng';

describe('fixture generator', () => {
  it('derives one seed per attempt', () => {
    expect(seedFor(1, 1)).not.toBe(seedFor(1, 2));
    expect(seedFor(1, 1)).toBe(seedFor(1, 1));
  });

  it('builds a full solvable slate', () => {
    const slate = generateSlate(CLUBS, 1);
    expect(slate.fixtures).toHaveLength(FIXTURES_PER_SLATE);
    expect(slate.fallback).toBe(false);
    expect(isSolvableSlate(slate.fixtures)).toBe(true);
  });

  it('is deterministic for the same matchday and varies between matchdays', () => {
    const a = generateSlate(CLUBS, 7);
    const b = generateSlate(CLUBS, 7);
    const c = generateSlate(CLUBS, 8);
    expect(a.fixtures.map(f => f.id)).toEqual(b.fixtures.map(f => f.id));
    expect(a.fixtures.map(f => f.id)).not.toEqual(c.fixtures.map(f => f.id));
  });

  it('never repeats a club inside one slate', () => {
    const slate = generateSlate(CLUBS, 3);
    const ids: string[] = [];
    slate.fixtures.forEach(f => {
      ids.push(f.homeId, f.awayId);
    });
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('produces normalised probabilities and clamped odds', () => {
    const slate = generateSlate(CLUBS, 2);
    slate.fixtures.forEach(f => {
      const sum = f.probabilities[0] + f.probabilities[1] + f.probabilities[2];
      expect(sum).toBeCloseTo(1, 6);
      f.odds.forEach(o => {
        expect(o).toBeGreaterThanOrEqual(1.08);
        expect(o).toBeLessThanOrEqual(12);
      });
    });
  });
});
