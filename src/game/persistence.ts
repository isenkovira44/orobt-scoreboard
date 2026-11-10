import { HISTORY_LIMIT, STARTING_BALANCE, STARTING_TOKENS } from '../constants/config';
import { ChallengeId } from './challenges';
import { Club, CLUBS } from './league';
import { SlipOutcome } from './settlement';
import { getStorage } from './storage';

export const SAVE_KEY = 'orobet.save.v1';

export type Settings = {
  multiplierFormat: 'decimal' | 'chance';
  revealSpeed: 'normal' | 'fast';
  bankerHint: boolean;
  reduceMotion: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  multiplierFormat: 'decimal',
  revealSpeed: 'normal',
  bankerHint: true,
  reduceMotion: false,
};

export type HistoryEntry = {
  matchday: number;
  hits: number;
  legs: number;
  accuracy: number;
  stake: number;
  payout: number;
  outcome: SlipOutcome;
  homePicks: number;
  drawPicks: number;
  bankerSet: boolean;
  bankerHit: boolean;
};

export type SaveBlob = {
  balance: number;
  xp: number;
  level: number;
  matchday: number;
  streakMultiplier: number;
  dailyStreak: number;
  shields: number;
  tokens: number;
  badges: string[];
  history: HistoryEntry[];
  challengesDone: ChallengeId[];
  settings: Settings;
  clubs: Club[];
  lastDailyIndex: number;
  lastTopUpIndex: number;
};

export function defaultSave(): SaveBlob {
  return {
    balance: STARTING_BALANCE,
    xp: 0,
    level: 1,
    matchday: 1,
    streakMultiplier: 1,
    dailyStreak: 0,
    shields: 0,
    tokens: STARTING_TOKENS,
    badges: [],
    history: [],
    challengesDone: [],
    settings: { ...DEFAULT_SETTINGS },
    clubs: CLUBS.map(c => ({ ...c, form: c.form.slice() })),
    lastDailyIndex: 0,
    lastTopUpIndex: 0,
  };
}

/** The ONLY module that touches storage. Screens never do. */
export function loadSave(): SaveBlob {
  const base = defaultSave();
  const stored = getStorage().read<Partial<SaveBlob>>(SAVE_KEY, {});
  const merged: SaveBlob = { ...base, ...stored } as SaveBlob;
  merged.settings = { ...DEFAULT_SETTINGS, ...(stored.settings || {}) };
  merged.history = (merged.history || []).slice(-HISTORY_LIMIT);
  merged.badges = merged.badges || [];
  merged.challengesDone = merged.challengesDone || [];
  merged.clubs = merged.clubs && merged.clubs.length ? merged.clubs : base.clubs;
  return merged;
}

export function saveSave(blob: SaveBlob): void {
  getStorage().write(SAVE_KEY, { ...blob, history: blob.history.slice(-HISTORY_LIMIT) });
}

export function resetSave(): SaveBlob {
  getStorage().clear();
  const fresh = defaultSave();
  saveSave(fresh);
  return fresh;
}

export function pushHistory(history: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  return history.concat(entry).slice(-HISTORY_LIMIT);
}
