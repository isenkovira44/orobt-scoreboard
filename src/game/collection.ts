export type BadgeArt =
  | { kind: 'crest'; crestIndex: number }
  | { kind: 'icon'; icon: 'flame' | 'shield' | 'crown' | 'zap' | 'star' | 'compass' | 'gem' };

export type Badge = {
  id: string;
  name: string;
  condition: string;
  art: BadgeArt;
  tint: string;
};

export type BadgeContext = {
  hits: number;
  legs: number;
  accuracy: number;
  payout: number;
  bankerHit: boolean;
  cashed: boolean;
  dailyStreak: number;
  level: number;
  slipsPlayed: number;
  challengeDone: string | null;
  usedInsight: boolean;
  longShotHit: boolean;
};

/** 12 badges, each with an explicit condition. Every icon in the set is distinct. */
export const BADGES: Badge[] = [
  { id: 'firstslip', name: 'FIRST SLIP', condition: 'SETTLE YOUR FIRST SLIP', art: { kind: 'crest', crestIndex: 0 }, tint: '#00E27A' },
  { id: 'clean', name: 'CLEAN READ', condition: 'HIT EVERY LEG ON A SLIP', art: { kind: 'crest', crestIndex: 1 }, tint: '#00E27A' },
  { id: 'century', name: 'CENTURY ANALYST', condition: 'WIN 100 SP OR MORE IN ONE SLIP', art: { kind: 'crest', crestIndex: 2 }, tint: '#E0B15C' },
  { id: 'marathon', name: 'MARATHON', condition: 'SETTLE 10 SLIPS', art: { kind: 'crest', crestIndex: 3 }, tint: '#A29BFE' },
  { id: 'derbyking', name: 'DERBY KING', condition: 'CLEAR THE DERBY WEEK CHALLENGE', art: { kind: 'crest', crestIndex: 4 }, tint: '#A29BFE' },
  { id: 'firewall', name: 'BANKER NERVE', condition: 'LAND A BANKER LEG', art: { kind: 'icon', icon: 'flame' }, tint: '#E0B15C' },
  { id: 'shielded', name: 'SHIELDED', condition: 'HOLD A STREAK SHIELD', art: { kind: 'icon', icon: 'shield' }, tint: '#74B9FF' },
  { id: 'sweeper', name: 'SWEEPER', condition: 'CLEAR THE CLEAN SWEEP CHALLENGE', art: { kind: 'icon', icon: 'crown' }, tint: '#E0B15C' },
  { id: 'spark', name: 'QUICK EXIT', condition: 'CASH OUT A LIVE SLIP', art: { kind: 'icon', icon: 'zap' }, tint: '#00E27A' },
  { id: 'streak3', name: 'THREE IN A ROW', condition: 'WIN 3 SLIPS IN A ROW', art: { kind: 'icon', icon: 'star' }, tint: '#00E27A' },
  { id: 'scout', name: 'SCOUT', condition: 'SPEND AN INSIGHT TOKEN', art: { kind: 'icon', icon: 'compass' }, tint: '#A29BFE' },
  { id: 'longshot', name: 'LONG SHOT', condition: 'HIT A LEG AT ODDS 4.00 OR MORE', art: { kind: 'icon', icon: 'gem' }, tint: '#FF5C7A' },
];

export function badgeById(id: string): Badge | undefined {
  return BADGES.find(b => b.id === id);
}

/** Evaluated after every round; returns the badge ids unlocked by THIS round. */
export function evaluateBadges(owned: string[], ctx: BadgeContext): string[] {
  const unlocked: string[] = [];
  const add = (id: string, condition: boolean) => {
    if (condition && owned.indexOf(id) < 0 && unlocked.indexOf(id) < 0) {
      unlocked.push(id);
    }
  };
  add('firstslip', ctx.slipsPlayed >= 1);
  add('clean', ctx.legs > 0 && ctx.hits === ctx.legs && !ctx.cashed);
  add('century', ctx.payout >= 100);
  add('marathon', ctx.slipsPlayed >= 10);
  add('derbyking', ctx.challengeDone === 'derby');
  add('firewall', ctx.bankerHit);
  add('shielded', ctx.challengeDone === 'lowvar');
  add('sweeper', ctx.challengeDone === 'sweep');
  add('spark', ctx.cashed);
  add('streak3', ctx.dailyStreak >= 3);
  add('scout', ctx.usedInsight);
  add('longshot', ctx.longShotHit);
  return unlocked;
}
