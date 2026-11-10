import { HiddenStats } from './odds';
import { Rng, randInt } from './rng';

/** Hidden per-fixture values: fatigue 0-20 and a key-player-out flag. */
export function rollHidden(rng: Rng): HiddenStats {
  return { fatigue: randInt(rng, 0, 20), keyPlayerOut: rng() < 0.22 };
}

export function describeHidden(hidden: HiddenStats): string {
  return 'FATIGUE ' + hidden.fatigue + (hidden.keyPlayerOut ? ' · KEY PLAYER OUT' : ' · SQUAD FIT');
}

export function canSpendToken(tokens: number): boolean {
  return tokens > 0;
}

export function spendToken(tokens: number): number {
  return Math.max(0, tokens - 1);
}

/** +1 per correct banker, +1 at daily streak 3, +2 from UNDERDOG HUNT. */
export function tokensEarned(bankerHit: boolean, dailyStreak: number): number {
  return (bankerHit ? 1 : 0) + (dailyStreak === 3 ? 1 : 0);
}
