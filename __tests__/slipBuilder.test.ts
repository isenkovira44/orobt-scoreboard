import { generateSlate } from '../src/game/fixtureGenerator';
import { CLUBS } from '../src/game/league';
import { legsFromPicks, toWin, totalMultiplier, validateSlip } from '../src/game/slip';

const slate = generateSlate(CLUBS, 1);

describe('slip builder', () => {
  it('turns picks into legs in slate order', () => {
    const picks = {
      [slate.fixtures[0].id]: 0 as const,
      [slate.fixtures[2].id]: 2 as const,
    };
    const legs = legsFromPicks(slate.fixtures, picks);
    expect(legs).toHaveLength(2);
    expect(legs[0].fixtureId).toBe(slate.fixtures[0].id);
    expect(legs[0].odds).toBe(slate.fixtures[0].odds[0]);
  });

  it('multiplies every leg and applies the banker boost once', () => {
    const legs = [
      { fixtureId: 'a', outcome: 0 as const, odds: 2 },
      { fixtureId: 'b', outcome: 1 as const, odds: 3 },
    ];
    expect(totalMultiplier(legs, null)).toBe(6);
    expect(totalMultiplier(legs, 'a')).toBe(9);
    expect(totalMultiplier([], null)).toBe(0);
  });

  it('floors the payout', () => {
    expect(toWin(100, 6.42)).toBe(642);
    expect(toWin(50, 1.999)).toBe(99);
  });

  it('requires three legs and a stake inside the balance', () => {
    const two = [
      { fixtureId: 'a', outcome: 0 as const, odds: 2 },
      { fixtureId: 'b', outcome: 0 as const, odds: 2 },
    ];
    expect(validateSlip(two, 50, 1000, null, null).ok).toBe(false);
    expect(validateSlip(two, 50, 1000, null, null).reason).toBe('PICK AT LEAST 3 LEGS');

    const three = two.concat({ fixtureId: 'c', outcome: 0 as const, odds: 2 });
    expect(validateSlip(three, 50, 1000, null, null).ok).toBe(true);
    expect(validateSlip(three, 5000, 1000, null, null).reason).toBe('STAKE OVER BALANCE');
  });
});
