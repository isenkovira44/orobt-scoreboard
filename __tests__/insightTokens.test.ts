import { STARTING_TOKENS } from '../src/constants/config';
import { canSpendToken, describeHidden, rollHidden, spendToken, tokensEarned } from '../src/game/insight';
import { CLUBS } from '../src/game/league';
import { hiddenModifier, probabilities } from '../src/game/odds';
import { mulberry32 } from '../src/game/rng';

describe('insight tokens', () => {
  it('starts with two and spends down to zero', () => {
    expect(STARTING_TOKENS).toBe(2);
    expect(canSpendToken(2)).toBe(true);
    expect(spendToken(2)).toBe(1);
    expect(spendToken(0)).toBe(0);
    expect(canSpendToken(0)).toBe(false);
  });

  it('rolls fatigue inside the documented range', () => {
    const rng = mulberry32(42);
    for (let i = 0; i < 50; i++) {
      const hidden = rollHidden(rng);
      expect(hidden.fatigue).toBeGreaterThanOrEqual(0);
      expect(hidden.fatigue).toBeLessThanOrEqual(20);
      expect(typeof hidden.keyPlayerOut).toBe('boolean');
    }
  });

  it('describes the revealed stats without emoji or arrow glyphs', () => {
    const text = describeHidden({ fatigue: 18, keyPlayerOut: true });
    expect(text).toContain('FATIGUE 18');
    expect(text).toContain('KEY PLAYER OUT');
    expect(/[←-⇿▶›]/.test(text)).toBe(false);
  });

  it('lets the hidden stats really move the simulation', () => {
    const fresh = { fatigue: 0, keyPlayerOut: false };
    const tired = { fatigue: 20, keyPlayerOut: true };
    expect(hiddenModifier(tired)).toBeLessThan(hiddenModifier(fresh));
    const strong = probabilities(CLUBS[0], CLUBS[8], fresh, fresh);
    const weakened = probabilities(CLUBS[0], CLUBS[8], tired, fresh);
    expect(weakened[0]).toBeLessThan(strong[0]);
  });

  it('returns a token for a correct banker and at daily streak three', () => {
    expect(tokensEarned(true, 0)).toBe(1);
    expect(tokensEarned(false, 3)).toBe(1);
    expect(tokensEarned(true, 3)).toBe(2);
    expect(tokensEarned(false, 1)).toBe(0);
  });
});
