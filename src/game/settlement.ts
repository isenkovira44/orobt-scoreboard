import { CASH_OUT_RATE } from '../constants/config';
import { Fixture } from './fixtureGenerator';
import { Outcome } from './odds';
import { Rng } from './rng';
import { Leg, totalMultiplier } from './slip';

export type LegResult = {
  fixtureId: string;
  outcome: Outcome;
  actual: Outcome;
  hit: boolean;
  homeGoals: number;
  awayGoals: number;
  odds: number;
};

const HOME_SCORES: Array<[number, number]> = [
  [1, 0],
  [2, 0],
  [2, 1],
  [3, 1],
];
const DRAW_SCORES: Array<[number, number]> = [
  [0, 0],
  [1, 1],
  [2, 2],
];

/** Fixtures are simulated from the TRUE probabilities, never from the margined odds. */
export function simulateOutcome(fixture: Fixture, rng: Rng): Outcome {
  const roll = rng();
  const p = fixture.probabilities;
  if (roll < p[0]) {
    return 0;
  }
  if (roll < p[0] + p[1]) {
    return 1;
  }
  return 2;
}

export function scoreLine(outcome: Outcome, rng: Rng): [number, number] {
  if (outcome === 1) {
    return DRAW_SCORES[Math.floor(rng() * DRAW_SCORES.length)];
  }
  const base = HOME_SCORES[Math.floor(rng() * HOME_SCORES.length)];
  return outcome === 0 ? [base[0], base[1]] : [base[1], base[0]];
}

export function settleLegs(fixtures: Fixture[], legs: Leg[], rng: Rng): LegResult[] {
  return legs.map(leg => {
    const fixture = fixtures.find(f => f.id === leg.fixtureId) || fixtures[0];
    const actual = simulateOutcome(fixture, rng);
    const score = scoreLine(actual, rng);
    return {
      fixtureId: leg.fixtureId,
      outcome: leg.outcome,
      actual,
      hit: actual === leg.outcome,
      homeGoals: score[0],
      awayGoals: score[1],
      odds: leg.odds,
    };
  });
}

export function hitsOf(results: LegResult[]): number {
  return results.filter(r => r.hit).length;
}

export function accuracyOf(results: LegResult[]): number {
  return results.length === 0 ? 0 : hitsOf(results) / results.length;
}

export function payoutFor(
  stake: number,
  legs: Leg[],
  bankerId: string | null,
  results: LegResult[],
): number {
  if (results.length === 0 || results.some(r => !r.hit)) {
    return 0;
  }
  return Math.floor(stake * totalMultiplier(legs, bankerId));
}

/** Cash out pays 70 % of what has already landed, and only while the slip is clean. */
export function cashOutValue(stake: number, settled: LegResult[]): number {
  if (settled.length === 0 || settled.some(r => !r.hit)) {
    return 0;
  }
  const product = settled.reduce((acc, r) => acc * r.odds, 1);
  return Math.floor(stake * product * CASH_OUT_RATE);
}

export function canCashOut(settled: LegResult[], totalLegs: number): boolean {
  return settled.length > 0 && settled.length < totalLegs && settled.every(r => r.hit);
}

export type SlipOutcome = 'landed' | 'banker' | 'busted' | 'cashed';

/** Headlines are in the words of this game, never a generic win or lose line. */
export function headlineFor(outcome: SlipOutcome): string {
  switch (outcome) {
    case 'landed':
      return 'SLIP LANDED';
    case 'banker':
      return 'BANKER SAVED IT';
    case 'cashed':
      return 'CASHED OUT';
    case 'busted':
    default:
      return 'SLIP BUSTED';
  }
}

export function outcomeFor(
  results: LegResult[],
  bankerId: string | null,
  cashed: boolean,
): SlipOutcome {
  if (cashed) {
    return 'cashed';
  }
  const allHit = results.length > 0 && results.every(r => r.hit);
  if (!allHit) {
    return 'busted';
  }
  const bankerResult = bankerId ? results.find(r => r.fixtureId === bankerId) : undefined;
  return bankerResult && bankerResult.hit ? 'banker' : 'landed';
}

/** Once a miss has landed the slip can no longer pay, so the rest fast-settles. */
export function isDecided(settled: LegResult[]): boolean {
  return settled.some(r => !r.hit);
}
