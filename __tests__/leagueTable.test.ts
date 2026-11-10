import { CLUBS, driftLeague, formPoints, headToHead } from '../src/game/league';

describe('league table', () => {
  it('ships ten clubs with ratings in range', () => {
    expect(CLUBS).toHaveLength(10);
    CLUBS.forEach(club => {
      expect(club.attack).toBeGreaterThanOrEqual(55);
      expect(club.attack).toBeLessThanOrEqual(88);
      expect(club.defense).toBeGreaterThanOrEqual(52);
      expect(club.defense).toBeLessThanOrEqual(86);
      expect(club.form).toHaveLength(5);
    });
  });

  it('counts last five form points', () => {
    expect(formPoints(['W', 'W', 'W', 'W', 'W'])).toBe(15);
    expect(formPoints(['L', 'L', 'L', 'L', 'L'])).toBe(0);
    expect(formPoints(['W', 'D', 'L', 'D', 'W'])).toBe(8);
  });

  it('drifts ratings after a matchday and keeps the form window at five', () => {
    const before = CLUBS[0];
    const after = driftLeague(CLUBS, [
      { homeId: CLUBS[0].id, awayId: CLUBS[1].id, outcome: 0 },
    ]);
    const home = after.find(c => c.id === CLUBS[0].id);
    expect(home).toBeDefined();
    expect(home!.attack).toBe(Math.min(95, before.attack + 3));
    expect(home!.form).toHaveLength(5);
    expect(home!.form[4]).toBe('W');
    expect(CLUBS[0].attack).toBe(before.attack);
  });

  it('gives a stable head to head record per pair', () => {
    const a = headToHead('hrv', 'grc');
    const b = headToHead('hrv', 'grc');
    expect(a).toEqual(b);
    expect(a[0] + a[1] + a[2]).toBeLessThanOrEqual(5);
  });
});
