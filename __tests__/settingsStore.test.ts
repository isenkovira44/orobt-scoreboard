import { ANIM, REVEAL_MS_FAST, REVEAL_MS_NORMAL } from '../src/constants/config';
import { DEFAULT_SETTINGS, Settings, loadSave, saveSave } from '../src/game/persistence';
import { MemoryStorage, setStorage } from '../src/game/storage';
import { SETTING_OPTIONS } from '../src/hooks/useSettings';
import { formatOdds } from '../src/utils/format';

beforeEach(() => {
  setStorage(new MemoryStorage());
});

describe('settings store', () => {
  it('ships the five documented defaults', () => {
    expect(DEFAULT_SETTINGS.multiplierFormat).toBe('decimal');
    expect(DEFAULT_SETTINGS.revealSpeed).toBe('normal');
    expect(DEFAULT_SETTINGS.bankerHint).toBe(true);
    expect(DEFAULT_SETTINGS.reduceMotion).toBe(false);
  });

  it('offers two options for every row', () => {
    expect(SETTING_OPTIONS.multiplierFormat).toHaveLength(2);
    expect(SETTING_OPTIONS.revealSpeed).toHaveLength(2);
    expect(SETTING_OPTIONS.toggle).toHaveLength(2);
  });

  it('changes the rendered multiplier', () => {
    expect(formatOdds(1.85, 'decimal')).toBe('x1.85');
    expect(formatOdds(1.85, 'chance')).toBe('54%');
  });

  it('changes the settle timing and the motion budget', () => {
    expect(REVEAL_MS_NORMAL).toBe(600);
    expect(REVEAL_MS_FAST).toBe(250);
    expect(ANIM.reduced).toBe(120);
  });

  it('persists a changed setting through the save blob', () => {
    const blob = loadSave();
    const next: Settings = { ...blob.settings, revealSpeed: 'fast', reduceMotion: true };
    saveSave({ ...blob, settings: next });
    const reloaded = loadSave();
    expect(reloaded.settings.revealSpeed).toBe('fast');
    expect(reloaded.settings.reduceMotion).toBe(true);
    expect(reloaded.settings.multiplierFormat).toBe('decimal');
  });
});
