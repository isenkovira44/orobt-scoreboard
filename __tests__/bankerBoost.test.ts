import { BANKER_BOOST } from '../src/constants/config';
import { outcomeFor } from '../src/game/settlement';
import { suggestedBanker, totalMultiplier, toWin } from '../src/game/slip';

const legs = [
  { fixtureId: 'a', outcome: 0 as const, odds: 1.5 },
  { fixtureId: 'b', outcome: 1 as const, odds: 4 },
  { fixtureId: 'c', outcome: 2 as const, odds: 2 },
];

describe('banker leg', () => {
  it('boosts exactly one leg by x1.5', () => {
    const plain = totalMultiplier(legs, null);
    const banked = totalMultiplier(legs, 'b');
    expect(BANKER_BOOST).toBe(1.5);
    expect(banked).toBeCloseTo(plain * 1.5, 2);
  });

  it('raises the amount to win', () => {
    expect(toWin(100, totalMultiplier(legs, 'b'))).toBeGreaterThan(
      toWin(100, totalMultiplier(legs, null)),
    );
  });

  it('ignores a banker that is not on the slip', () => {
    expect(totalMultiplier(legs, 'zzz')).toBe(totalMultiplier(legs, null));
  });

  it('hints the statistically strongest selected leg', () => {
    expect(suggestedBanker(legs)).toBe('a');
    expect(suggestedBanker([])).toBeNull();
  });

  it('reads BANKER SAVED IT only when the banker leg landed', () => {
    const results = legs.map(l => ({
      fixtureId: l.fixtureId,
      outcome: l.outcome,
      actual: l.outcome,
      hit: true,
      homeGoals: 1,
      awayGoals: 0,
      odds: l.odds,
    }));
    expect(outcomeFor(results, 'b', false)).toBe('banker');
    expect(outcomeFor(results, null, false)).toBe('landed');
  });
});
