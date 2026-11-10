import { STREAK_CAP, applyStreak } from '../src/game/streak';

const base = { streakMultiplier: 1, dailyStreak: 0, shields: 0 };

describe('streak multiplier', () => {
  it('rises on a matchday at sixty percent or better', () => {
    const next = applyStreak(base, 0.6);
    expect(next.streakMultiplier).toBeCloseTo(1.2, 5);
    expect(next.dailyStreak).toBe(1);
    expect(next.raised).toBe(true);
  });

  it('never passes the cap', () => {
    const next = applyStreak({ ...base, streakMultiplier: 2 }, 1);
    expect(next.streakMultiplier).toBe(STREAK_CAP);
  });

  it('holds between forty and sixty percent', () => {
    const next = applyStreak({ ...base, streakMultiplier: 1.4, dailyStreak: 2 }, 0.5);
    expect(next.streakMultiplier).toBe(1.4);
    expect(next.dailyStreak).toBe(2);
  });

  it('resets below forty percent', () => {
    const next = applyStreak({ streakMultiplier: 1.8, dailyStreak: 4, shields: 0 }, 0.2);
    expect(next.streakMultiplier).toBe(1);
    expect(next.dailyStreak).toBe(0);
  });

  it('consumes a shield instead of resetting', () => {
    const next = applyStreak({ streakMultiplier: 1.8, dailyStreak: 4, shields: 1 }, 0.2);
    expect(next.shieldUsed).toBe(true);
    expect(next.shields).toBe(0);
    expect(next.streakMultiplier).toBe(1.8);
    expect(next.dailyStreak).toBe(4);
  });
});
