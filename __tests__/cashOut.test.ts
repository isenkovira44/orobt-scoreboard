import { CASH_OUT_RATE } from '../src/constants/config';
import { canCashOut, cashOutValue, outcomeFor } from '../src/game/settlement';

const hit = (id: string, odds: number) => ({
  fixtureId: id,
  outcome: 0 as const,
  actual: 0 as const,
  hit: true,
  homeGoals: 1,
  awayGoals: 0,
  odds,
});

const miss = (id: string, odds: number) => ({
  ...hit(id, odds),
  actual: 2 as const,
  hit: false,
});

describe('cash out', () => {
  it('pays 70 percent of what has landed', () => {
    expect(CASH_OUT_RATE).toBe(0.7);
    expect(cashOutValue(100, [hit('a', 2), hit('b', 3)])).toBe(Math.floor(100 * 6 * 0.7));
  });

  it('is offered only while every settled leg is a hit and legs remain', () => {
    expect(canCashOut([hit('a', 2)], 3)).toBe(true);
    expect(canCashOut([hit('a', 2), miss('b', 2)], 3)).toBe(false);
    expect(canCashOut([], 3)).toBe(false);
    expect(canCashOut([hit('a', 2), hit('b', 2), hit('c', 2)], 3)).toBe(false);
  });

  it('pays nothing once a leg has missed', () => {
    expect(cashOutValue(100, [hit('a', 2), miss('b', 2)])).toBe(0);
  });

  it('ends the round as CASHED OUT', () => {
    expect(outcomeFor([hit('a', 2)], null, true)).toBe('cashed');
  });
});
