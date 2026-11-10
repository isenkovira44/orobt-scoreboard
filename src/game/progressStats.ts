import { HistoryEntry } from './persistence';

export type ProgressSummary = {
  slips: number;
  accuracy: number;
  bestStreak: number;
  homeRate: number;
  drawRate: number;
  bankerRate: number;
  samples: number[];
  hitSamples: number[];
  bestIndex: number;
};

/** Aggregates the last matchdays into the numbers ProgressScreen shows. */
export function summarise(history: HistoryEntry[]): ProgressSummary {
  const slips = history.length;
  if (slips === 0) {
    return {
      slips: 0,
      accuracy: 0,
      bestStreak: 0,
      homeRate: 0,
      drawRate: 0,
      bankerRate: 0,
      samples: [],
      hitSamples: [],
      bestIndex: -1,
    };
  }

  const totalLegs = history.reduce((s, h) => s + h.legs, 0);
  const totalHits = history.reduce((s, h) => s + h.hits, 0);
  const totalHome = history.reduce((s, h) => s + h.homePicks, 0);
  const totalDraw = history.reduce((s, h) => s + h.drawPicks, 0);
  const bankerSlips = history.filter(h => h.bankerSet);
  const bankerHits = bankerSlips.filter(h => h.bankerHit).length;

  let streak = 0;
  let bestStreak = 0;
  history.forEach(h => {
    if (h.hits === h.legs && h.legs > 0) {
      streak += 1;
      bestStreak = Math.max(bestStreak, streak);
    } else {
      streak = 0;
    }
  });

  const samples = history.map(h => h.accuracy);
  const hitSamples = history.map(h => h.hits);
  let bestIndex = 0;
  hitSamples.forEach((v, i) => {
    if (v > hitSamples[bestIndex]) {
      bestIndex = i;
    }
  });

  return {
    slips,
    accuracy: totalLegs === 0 ? 0 : totalHits / totalLegs,
    bestStreak,
    homeRate: totalLegs === 0 ? 0 : totalHome / totalLegs,
    drawRate: totalLegs === 0 ? 0 : totalDraw / totalLegs,
    bankerRate: bankerSlips.length === 0 ? 0 : bankerHits / bankerSlips.length,
    samples,
    hitSamples,
    bestIndex,
  };
}
