export type StreakState = {
  streakMultiplier: number;
  dailyStreak: number;
  shields: number;
};

export const STREAK_STEP = 0.2;
export const STREAK_CAP = 2.0;
export const STREAK_RAISE_AT = 0.6;
export const STREAK_BREAK_AT = 0.4;

export type StreakUpdate = StreakState & { shieldUsed: boolean; raised: boolean };

/**
 * A matchday at 60 % accuracy or better raises the multiplier and the daily streak.
 * Below 40 % both reset, unless a Streak Shield is held, which is consumed instead.
 */
export function applyStreak(state: StreakState, accuracy: number): StreakUpdate {
  if (accuracy >= STREAK_RAISE_AT) {
    return {
      streakMultiplier: Math.min(STREAK_CAP, Math.round((state.streakMultiplier + STREAK_STEP) * 10) / 10),
      dailyStreak: state.dailyStreak + 1,
      shields: state.shields,
      shieldUsed: false,
      raised: true,
    };
  }
  if (accuracy < STREAK_BREAK_AT) {
    if (state.shields > 0) {
      return {
        streakMultiplier: state.streakMultiplier,
        dailyStreak: state.dailyStreak,
        shields: state.shields - 1,
        shieldUsed: true,
        raised: false,
      };
    }
    return { streakMultiplier: 1, dailyStreak: 0, shields: 0, shieldUsed: false, raised: false };
  }
  return { ...state, shieldUsed: false, raised: false };
}
