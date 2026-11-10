import { apEarned, levelForXp, levelProgress, xpForLevel } from '../src/game/progression';

describe('analyst level', () => {
  it('uses the documented thresholds', () => {
    expect(xpForLevel(2)).toBe(450);
    expect(xpForLevel(3)).toBe(900);
    expect(xpForLevel(4)).toBe(1500);
  });

  it('maps xp to a level', () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(449)).toBe(1);
    expect(levelForXp(450)).toBe(2);
    expect(levelForXp(1500)).toBe(4);
  });

  it('reports progress inside the current level', () => {
    const p = levelProgress(600);
    expect(p.level).toBe(2);
    expect(p.into).toBe(150);
    expect(p.span).toBe(450);
  });

  it('awards analyst points for hits, streak and a correct banker', () => {
    expect(apEarned(4, 1, false, 0)).toBe(40);
    expect(apEarned(4, 1.4, false, 0)).toBe(56);
    expect(apEarned(4, 1, true, 0)).toBe(45);
    expect(apEarned(4, 1, false, 0.25)).toBe(50);
  });
});
