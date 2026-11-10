/** Analyst level n requires 150 * n * (n + 1) / 2 XP: Lv.2 at 450, Lv.3 at 900, Lv.4 at 1500. */
export function xpForLevel(level: number): number {
  if (level <= 1) {
    return 0;
  }
  return (150 * level * (level + 1)) / 2;
}

export function levelForXp(xp: number): number {
  let level = 1;
  while (level < 20 && xp >= xpForLevel(level + 1)) {
    level += 1;
  }
  return level;
}

export type LevelProgress = { level: number; into: number; span: number; next: number };

export function levelProgress(xp: number): LevelProgress {
  const level = levelForXp(xp);
  const floor = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, into: Math.max(0, xp - floor), span: Math.max(1, next - floor), next };
}

/** AP (XP) earned by a settled matchday. */
export function apEarned(
  hits: number,
  streakMultiplier: number,
  bankerHit: boolean,
  accuracyBonus: number,
): number {
  const base = Math.floor(hits * 10 * streakMultiplier * (1 + accuracyBonus));
  return base + (bankerHit ? 5 : 0);
}
