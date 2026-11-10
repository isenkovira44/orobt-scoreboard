import { HistoryEntry } from '../src/game/persistence';
import { summarise } from '../src/game/progressStats';

const entry = (over: Partial<HistoryEntry>): HistoryEntry => ({
  matchday: 1,
  hits: 3,
  legs: 5,
  accuracy: 0.6,
  stake: 100,
  payout: 0,
  outcome: 'busted',
  homePicks: 3,
  drawPicks: 1,
  bankerSet: false,
  bankerHit: false,
  ...over,
});

describe('progress stats', () => {
  it('reports an empty summary with no history', () => {
    const s = summarise([]);
    expect(s.slips).toBe(0);
    expect(s.accuracy).toBe(0);
    expect(s.samples).toEqual([]);
    expect(s.bestIndex).toBe(-1);
  });

  it('aggregates accuracy over every leg, not per matchday', () => {
    const s = summarise([entry({ hits: 5, legs: 5 }), entry({ hits: 1, legs: 3 })]);
    expect(s.slips).toBe(2);
    expect(s.accuracy).toBeCloseTo(6 / 8, 6);
  });

  it('finds the best matchday and the longest clean streak', () => {
    const s = summarise([
      entry({ hits: 5, legs: 5 }),
      entry({ hits: 4, legs: 4 }),
      entry({ hits: 1, legs: 5 }),
      entry({ hits: 3, legs: 3 }),
    ]);
    expect(s.bestStreak).toBe(2);
    expect(s.hitSamples).toEqual([5, 4, 1, 3]);
    expect(s.bestIndex).toBe(0);
  });

  it('reports pick-type and banker rates', () => {
    const s = summarise([
      entry({ hits: 3, legs: 5, homePicks: 4, drawPicks: 1, bankerSet: true, bankerHit: true }),
      entry({ hits: 2, legs: 5, homePicks: 2, drawPicks: 2, bankerSet: true, bankerHit: false }),
    ]);
    expect(s.homeRate).toBeCloseTo(6 / 10, 6);
    expect(s.drawRate).toBeCloseTo(3 / 10, 6);
    expect(s.bankerRate).toBeCloseTo(0.5, 6);
  });
});
