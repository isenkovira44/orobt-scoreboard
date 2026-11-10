import type { Leg } from './slip';

export type ChallengeId = 'derby' | 'underdog' | 'sweep' | 'lowvar';

export type ChallengeDef = {
  id: ChallengeId;
  title: string;
  objective: string;
  reward: string;
  requiredLegs: number;
  unlockLevel: number;
  regionOnly: boolean;
  validate: (legs: Leg[], bankerId: string | null) => { ok: boolean; reason: string };
  blockPick: (odds: number) => string | null;
};

export const CHALLENGES: ChallengeDef[] = [
  {
    id: 'derby',
    title: 'DERBY WEEK',
    objective: 'ONE REGION ONLY · MINIMUM 4 LEGS',
    reward: '+25% ACCURACY POINTS',
    requiredLegs: 4,
    unlockLevel: 1,
    regionOnly: true,
    validate: legs =>
      legs.length >= 4 ? { ok: true, reason: '' } : { ok: false, reason: 'DERBY WEEK NEEDS 4 LEGS' },
    blockPick: () => null,
  },
  {
    id: 'underdog',
    title: 'UNDERDOG HUNT',
    objective: 'AT LEAST 2 LEGS AT ODDS 3.00 OR HIGHER',
    reward: '+2 INSIGHT TOKENS',
    requiredLegs: 3,
    unlockLevel: 1,
    regionOnly: false,
    validate: legs =>
      legs.filter(l => l.odds >= 3).length >= 2
        ? { ok: true, reason: '' }
        : { ok: false, reason: 'NEED 2 LEGS AT 3.00 OR MORE' },
    blockPick: () => null,
  },
  {
    id: 'sweep',
    title: 'CLEAN SWEEP',
    objective: 'ALL 5 LEGS · BANKER DISABLED',
    reward: 'STAKE x3 AND THE SWEEPER BADGE',
    requiredLegs: 5,
    unlockLevel: 2,
    regionOnly: false,
    validate: (legs, bankerId) => {
      if (legs.length < 5) {
        return { ok: false, reason: 'CLEAN SWEEP NEEDS 5 LEGS' };
      }
      if (bankerId) {
        return { ok: false, reason: 'BANKER IS DISABLED HERE' };
      }
      return { ok: true, reason: '' };
    },
    blockPick: () => null,
  },
  {
    id: 'lowvar',
    title: 'LOW VARIANCE',
    objective: 'ONLY LEGS AT ODDS 1.80 OR LOWER',
    reward: 'A STREAK SHIELD',
    requiredLegs: 3,
    unlockLevel: 3,
    regionOnly: false,
    validate: legs =>
      legs.every(l => l.odds <= 1.8)
        ? { ok: true, reason: '' }
        : { ok: false, reason: 'ODDS TOO HIGH FOR THIS CHALLENGE' },
    blockPick: odds => (odds > 1.8 ? 'ODDS TOO LOW FOR THIS CHALLENGE' : null),
  },
];

export function challengeById(id: ChallengeId): ChallengeDef {
  const found = CHALLENGES.find(c => c.id === id);
  return found || CHALLENGES[0];
}

export type ChallengeState = 'active' | 'complete' | 'locked';

export function challengeState(
  def: ChallengeDef,
  level: number,
  done: ChallengeId[],
): ChallengeState {
  if (done.indexOf(def.id) >= 0) {
    return 'complete';
  }
  return level >= def.unlockLevel ? 'active' : 'locked';
}

export function allCleared(done: ChallengeId[]): boolean {
  return CHALLENGES.every(c => done.indexOf(c.id) >= 0);
}

export type ChallengeReward = {
  tokens: number;
  shields: number;
  stakeMultiplier: number;
  accuracyBonus: number;
  badge: string | null;
};

export function challengeReward(id: ChallengeId): ChallengeReward {
  switch (id) {
    case 'derby':
      return { tokens: 0, shields: 0, stakeMultiplier: 1, accuracyBonus: 0.25, badge: null };
    case 'underdog':
      return { tokens: 2, shields: 0, stakeMultiplier: 1, accuracyBonus: 0, badge: null };
    case 'sweep':
      return { tokens: 0, shields: 0, stakeMultiplier: 3, accuracyBonus: 0, badge: 'sweeper' };
    case 'lowvar':
    default:
      return { tokens: 0, shields: 1, stakeMultiplier: 1, accuracyBonus: 0, badge: null };
  }
}
