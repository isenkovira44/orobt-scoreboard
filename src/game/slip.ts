import { BANKER_BOOST, MAX_LEGS, MIN_LEGS } from '../constants/config';
import { ChallengeId, challengeById } from './challenges';
import { Fixture } from './fixtureGenerator';
import { Outcome } from './odds';

export type Leg = {
  fixtureId: string;
  outcome: Outcome;
  odds: number;
};

export function legsFromPicks(
  fixtures: Fixture[],
  picks: Record<string, Outcome | undefined>,
): Leg[] {
  const legs: Leg[] = [];
  fixtures.forEach(f => {
    const outcome = picks[f.id];
    if (outcome === undefined) {
      return;
    }
    legs.push({ fixtureId: f.id, outcome, odds: f.odds[outcome] });
  });
  return legs;
}

export function totalMultiplier(legs: Leg[], bankerId: string | null): number {
  if (legs.length === 0) {
    return 0;
  }
  let total = 1;
  legs.forEach(leg => {
    total *= leg.odds * (bankerId === leg.fixtureId ? BANKER_BOOST : 1);
  });
  return Math.round(total * 100) / 100;
}

export function toWin(stake: number, multiplier: number): number {
  return Math.floor(stake * multiplier);
}

export type SlipValidation = { ok: boolean; reason: string };

export function validateSlip(
  legs: Leg[],
  stake: number,
  balance: number,
  challenge: ChallengeId | null,
  bankerId: string | null,
): SlipValidation {
  if (legs.length < MIN_LEGS) {
    return { ok: false, reason: 'PICK AT LEAST ' + MIN_LEGS + ' LEGS' };
  }
  if (legs.length > MAX_LEGS) {
    return { ok: false, reason: 'MAX ' + MAX_LEGS + ' LEGS' };
  }
  if (stake > balance) {
    return { ok: false, reason: 'STAKE OVER BALANCE' };
  }
  if (challenge) {
    const check = challengeById(challenge).validate(legs, bankerId);
    if (!check.ok) {
      return check;
    }
  }
  return { ok: true, reason: '' };
}

/** A pick a challenge forbids is disabled with its reason stated on screen. */
export function pickBlockedReason(odds: number, challenge: ChallengeId | null): string | null {
  if (!challenge) {
    return null;
  }
  return challengeById(challenge).blockPick(odds);
}

/** BANKER HINT setting: the statistically strongest selected leg. */
export function suggestedBanker(legs: Leg[]): string | null {
  if (legs.length === 0) {
    return null;
  }
  let best = legs[0];
  legs.forEach(leg => {
    if (leg.odds < best.odds) {
      best = leg;
    }
  });
  return best.fixtureId;
}
