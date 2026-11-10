import { DAILY_STAKE } from '../src/constants/config';
import { DAILY_LADDER, dailyPlayed, dailySeed, dailySlate, dayIndex } from '../src/game/dailyMode';
import { CLUBS } from '../src/game/league';

describe('daily mode', () => {
  it('builds a YYYYMMDD day index', () => {
    expect(dayIndex(new Date(2026, 10, 10))).toBe(20261110);
    expect(dayIndex(new Date(2026, 0, 1))).toBe(20260101);
  });

  it('seeds today identically on every call', () => {
    expect(dailySeed(20261110)).toBe(dailySeed(20261110));
    expect(dailySeed(20261110)).not.toBe(dailySeed(20261111));
  });

  it('reproduces the same slate for the same day and differs the next day', () => {
    const a = dailySlate(CLUBS, 20261110);
    const b = dailySlate(CLUBS, 20261110);
    const c = dailySlate(CLUBS, 20261111);
    expect(a.fixtures.map(f => f.id)).toEqual(b.fixtures.map(f => f.id));
    expect(a.fixtures.map(f => f.id)).not.toEqual(c.fixtures.map(f => f.id));
    expect(a.fixtures).toHaveLength(5);
  });

  it('allows one attempt per day at a fixed stake', () => {
    expect(DAILY_STAKE).toBe(100);
    expect(dailyPlayed(20261110, 20261110)).toBe(true);
    expect(dailyPlayed(0, 20261110)).toBe(false);
  });

  it('describes the reward ladder', () => {
    expect(DAILY_LADDER.map(s => s.days)).toEqual([3, 7]);
  });
});
