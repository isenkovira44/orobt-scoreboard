import { BADGES, badgeById, evaluateBadges } from '../src/game/collection';

const ctx = {
  hits: 0,
  legs: 0,
  accuracy: 0,
  payout: 0,
  bankerHit: false,
  cashed: false,
  dailyStreak: 0,
  level: 1,
  slipsPlayed: 0,
  challengeDone: null as string | null,
  usedInsight: false,
  longShotHit: false,
};

describe('collection unlocks', () => {
  it('ships twelve badges with unique ids, names and conditions', () => {
    expect(BADGES).toHaveLength(12);
    expect(new Set(BADGES.map(b => b.id)).size).toBe(12);
    expect(new Set(BADGES.map(b => b.name)).size).toBe(12);
    BADGES.forEach(b => expect(b.condition.length).toBeGreaterThan(0));
  });

  it('gives every badge a distinct icon inside its art family', () => {
    const icons = BADGES.filter(b => b.art.kind === 'icon').map(b =>
      b.art.kind === 'icon' ? b.art.icon : '',
    );
    const crests = BADGES.filter(b => b.art.kind === 'crest').map(b =>
      b.art.kind === 'crest' ? b.art.crestIndex : -1,
    );
    expect(new Set(icons).size).toBe(icons.length);
    expect(new Set(crests).size).toBe(crests.length);
    expect(crests).toHaveLength(5);
  });

  it('unlocks the first slip badge after one settled matchday', () => {
    expect(evaluateBadges([], { ...ctx, slipsPlayed: 1 })).toContain('firstslip');
  });

  it('unlocks a clean read only when every leg hit', () => {
    expect(evaluateBadges([], { ...ctx, hits: 4, legs: 4, slipsPlayed: 2 })).toContain('clean');
    expect(evaluateBadges([], { ...ctx, hits: 3, legs: 4, slipsPlayed: 2 })).not.toContain('clean');
  });

  it('never re-awards an owned badge', () => {
    const owned = ['firstslip'];
    expect(evaluateBadges(owned, { ...ctx, slipsPlayed: 1 })).not.toContain('firstslip');
  });

  it('resolves a badge by id', () => {
    expect(badgeById('century')!.name).toBe('CENTURY ANALYST');
    expect(badgeById('nope')).toBeUndefined();
  });
});
