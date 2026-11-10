import { FIXTURES_PER_SLATE, MAX_SLATE_ATTEMPTS } from '../constants/config';
import { rollHidden } from './insight';
import { CLUBS, Club, headToHead } from './league';
import { HiddenStats, Outcome, oddsFromProbabilities, probabilities } from './odds';
import { Rng, mulberry32, seedFor, shuffle } from './rng';

export type Fixture = {
  id: string;
  homeId: string;
  awayId: string;
  homeName: string;
  awayName: string;
  homeShort: string;
  awayShort: string;
  homeCrest: number;
  awayCrest: number;
  region: string;
  homeForm: number;
  awayForm: number;
  homeAtk: number;
  homeDef: number;
  awayAtk: number;
  awayDef: number;
  h2h: [number, number, number];
  probabilities: [number, number, number];
  odds: [number, number, number];
  homeHidden: HiddenStats;
  awayHidden: HiddenStats;
};

export type Slate = {
  fixtures: Fixture[];
  seed: number;
  attempts: number;
  fallback: boolean;
};

function buildFixture(home: Club, away: Club, rng: Rng): Fixture {
  const homeHidden = rollHidden(rng);
  const awayHidden = rollHidden(rng);
  const p = probabilities(home, away, homeHidden, awayHidden);
  return {
    id: home.id + '-' + away.id,
    homeId: home.id,
    awayId: away.id,
    homeName: home.name,
    awayName: away.name,
    homeShort: home.short,
    awayShort: away.short,
    homeCrest: home.crestIndex,
    awayCrest: away.crestIndex,
    region: home.region,
    homeForm: home.form.slice(-5).reduce((s, r) => s + (r === 'W' ? 3 : r === 'D' ? 1 : 0), 0),
    awayForm: away.form.slice(-5).reduce((s, r) => s + (r === 'W' ? 3 : r === 'D' ? 1 : 0), 0),
    homeAtk: home.attack,
    homeDef: home.defense,
    awayAtk: away.attack,
    awayDef: away.defense,
    h2h: headToHead(home.id, away.id),
    probabilities: p,
    odds: oddsFromProbabilities(p),
    homeHidden,
    awayHidden,
  };
}

/**
 * A slate is playable when it offers BOTH a safe leg and a real decision:
 * one clear favourite (pMax >= 0.55) and one genuine toss-up, measured as the
 * home/away spread (|p1 - p2| <= 0.15) because the draw branch is always the
 * smallest outcome and would make a three-way spread test unsatisfiable.
 */
export function isSolvableSlate(fixtures: Fixture[]): boolean {
  const hasFavourite = fixtures.some(f => Math.max(f.probabilities[0], f.probabilities[2]) >= 0.55);
  const hasTossUp = fixtures.some(f => Math.abs(f.probabilities[0] - f.probabilities[2]) <= 0.15);
  return hasFavourite && hasTossUp;
}

function drawFixtures(clubs: Club[], rng: Rng, regionOnly?: string): Fixture[] {
  const pool = regionOnly ? clubs.filter(c => c.region === regionOnly) : clubs;
  const source = pool.length >= FIXTURES_PER_SLATE * 2 ? pool : clubs;
  const order = shuffle(rng, source);
  const fixtures: Fixture[] = [];
  for (let i = 0; i + 1 < order.length && fixtures.length < FIXTURES_PER_SLATE; i += 2) {
    fixtures.push(buildFixture(order[i], order[i + 1], rng));
  }
  return fixtures;
}

/** Last-resort constant slate — a guarantee, not the game. */
export function fallbackSlate(): Fixture[] {
  const rng = mulberry32(20261110);
  return [
    buildFixture(CLUBS[0], CLUBS[8], rng),
    buildFixture(CLUBS[3], CLUBS[6], rng),
    buildFixture(CLUBS[1], CLUBS[5], rng),
    buildFixture(CLUBS[9], CLUBS[2], rng),
    buildFixture(CLUBS[4], CLUBS[7], rng),
  ];
}

export const FALLBACK_SLATE = fallbackSlate();

export function generateSlate(
  clubs: Club[],
  matchday: number,
  options?: { regionOnly?: string; seedOverride?: number },
): Slate {
  for (let attempt = 0; attempt < MAX_SLATE_ATTEMPTS; attempt++) {
    const seed =
      options && options.seedOverride !== undefined
        ? (options.seedOverride ^ (attempt * 104729)) >>> 0
        : seedFor(matchday, attempt + 1);
    const rng = mulberry32(seed);
    const fixtures = drawFixtures(clubs, rng, options && options.regionOnly);
    if (fixtures.length === FIXTURES_PER_SLATE && isSolvableSlate(fixtures)) {
      return { fixtures, seed, attempts: attempt + 1, fallback: false };
    }
  }
  return { fixtures: fallbackSlate(), seed: 0, attempts: MAX_SLATE_ATTEMPTS, fallback: true };
}

export function outcomeOdds(fixture: Fixture, outcome: Outcome): number {
  return fixture.odds[outcome];
}
