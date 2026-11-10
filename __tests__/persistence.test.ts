import { HISTORY_LIMIT, STARTING_BALANCE, STARTING_TOKENS } from '../src/constants/config';
import { HistoryEntry, defaultSave, loadSave, pushHistory, resetSave, saveSave } from '../src/game/persistence';
import { MemoryStorage, getStorage, setStorage } from '../src/game/storage';

beforeEach(() => {
  setStorage(new MemoryStorage());
});

const entry = (matchday: number): HistoryEntry => ({
  matchday,
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
});

describe('persistence', () => {
  it('starts a new analyst with the documented balance', () => {
    const blob = defaultSave();
    expect(blob.balance).toBe(STARTING_BALANCE);
    expect(blob.tokens).toBe(STARTING_TOKENS);
    expect(blob.level).toBe(1);
    expect(blob.history).toEqual([]);
  });

  it('round-trips the whole blob through the storage interface', () => {
    const blob = { ...defaultSave(), balance: 1234, xp: 500, badges: ['clean'] };
    saveSave(blob);
    const loaded = loadSave();
    expect(loaded.balance).toBe(1234);
    expect(loaded.xp).toBe(500);
    expect(loaded.badges).toEqual(['clean']);
  });

  it('survives a cold start with a partial or damaged blob', () => {
    getStorage().write('orobet.save.v1', { balance: 50 });
    const loaded = loadSave();
    expect(loaded.balance).toBe(50);
    expect(loaded.settings.revealSpeed).toBe('normal');
    expect(loaded.clubs.length).toBe(10);
  });

  it('keeps the history window bounded', () => {
    let history: HistoryEntry[] = [];
    for (let i = 0; i < HISTORY_LIMIT + 5; i++) {
      history = pushHistory(history, entry(i));
    }
    expect(history).toHaveLength(HISTORY_LIMIT);
    expect(history[history.length - 1].matchday).toBe(HISTORY_LIMIT + 4);
  });

  it('resets back to a fresh analyst', () => {
    saveSave({ ...defaultSave(), balance: 10, xp: 9999, badges: ['clean'] });
    const fresh = resetSave();
    expect(fresh.balance).toBe(STARTING_BALANCE);
    expect(fresh.xp).toBe(0);
    expect(fresh.badges).toEqual([]);
    expect(loadSave().balance).toBe(STARTING_BALANCE);
  });
});
