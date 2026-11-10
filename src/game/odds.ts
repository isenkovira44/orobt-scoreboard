import { ODDS_MAX, ODDS_MIN, OROBET_EDGE } from '../constants/config';
import { Club, formPoints } from './league';

/** 0 = home (1), 1 = draw (X), 2 = away (2). */
export type Outcome = 0 | 1 | 2;
export const OUTCOME_LABELS: Record<Outcome, string> = { 0: '1', 1: 'X', 2: '2' };

export type HiddenStats = { fatigue: number; keyPlayerOut: boolean };

/** Hidden stats really shift strength — an Insight reveal buys a better decision. */
export function hiddenModifier(hidden: HiddenStats): number {
  return -hidden.fatigue * 0.35 + (hidden.keyPlayerOut ? -4 : 0);
}

export function strengthOf(club: Club, hidden: HiddenStats, homeBoost: number): number {
  return (
    club.attack * 0.5 +
    club.defense * 0.3 +
    formPoints(club.form) * 2 +
    homeBoost +
    hiddenModifier(hidden)
  );
}

export function probabilities(
  home: Club,
  away: Club,
  homeHidden: HiddenStats,
  awayHidden: HiddenStats,
): [number, number, number] {
  const sH = strengthOf(home, homeHidden, 4);
  const sA = strengthOf(away, awayHidden, 0);
  const raw = [Math.max(1, sH), Math.max(1, (sH + sA) * 0.16), Math.max(1, sA)];
  const sum = raw[0] + raw[1] + raw[2];
  return [raw[0] / sum, raw[1] / sum, raw[2] / sum];
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function oddsFromProbabilities(p: [number, number, number]): [number, number, number] {
  const toOdds = (prob: number) =>
    Math.max(ODDS_MIN, Math.min(ODDS_MAX, round2(OROBET_EDGE / Math.max(prob, 0.0001))));
  return [toOdds(p[0]), toOdds(p[1]), toOdds(p[2])];
}

/** Implied chance shown by the CHANCE multiplier format. */
export function impliedChance(odds: number): number {
  return 1 / odds;
}
