import {
  CHALLENGES,
  allCleared,
  challengeById,
  challengeReward,
  challengeState,
} from '../src/game/challenges';
import { pickBlockedReason, validateSlip } from '../src/game/slip';

const leg = (id: string, odds: number) => ({ fixtureId: id, outcome: 0 as const, odds });

describe('challenge objectives', () => {
  it('defines four challenges with unique ids and rewards', () => {
    expect(CHALLENGES).toHaveLength(4);
    expect(new Set(CHALLENGES.map(c => c.id)).size).toBe(4);
    CHALLENGES.forEach(c => {
      expect(c.reward.length).toBeGreaterThan(0);
      expect(c.objective.length).toBeGreaterThan(0);
    });
  });

  it('locks challenges behind the analyst level', () => {
    expect(challengeState(challengeById('sweep'), 1, [])).toBe('locked');
    expect(challengeState(challengeById('sweep'), 2, [])).toBe('active');
    expect(challengeState(challengeById('sweep'), 2, ['sweep'])).toBe('complete');
  });

  it('rejects a slip that breaks the active objective', () => {
    const three = [leg('a', 1.5), leg('b', 1.6), leg('c', 1.7)];
    expect(validateSlip(three, 50, 1000, 'derby', null).reason).toBe('DERBY WEEK NEEDS 4 LEGS');
    expect(validateSlip(three, 50, 1000, 'underdog', null).reason).toBe(
      'NEED 2 LEGS AT 3.00 OR MORE',
    );
    expect(validateSlip(three, 50, 1000, 'lowvar', null).ok).toBe(true);
    const high = [leg('a', 1.5), leg('b', 2.4), leg('c', 1.7)];
    expect(validateSlip(high, 50, 1000, 'lowvar', null).ok).toBe(false);
  });

  it('disables a forbidden pick with a stated reason', () => {
    expect(pickBlockedReason(2.5, 'lowvar')).toBe('ODDS TOO LOW FOR THIS CHALLENGE');
    expect(pickBlockedReason(1.5, 'lowvar')).toBeNull();
    expect(pickBlockedReason(9, null)).toBeNull();
  });

  it('disables the banker for CLEAN SWEEP and needs all five legs', () => {
    const five = [leg('a', 2), leg('b', 2), leg('c', 2), leg('d', 2), leg('e', 2)];
    expect(validateSlip(five, 50, 1000, 'sweep', null).ok).toBe(true);
    expect(validateSlip(five, 50, 1000, 'sweep', 'a').reason).toBe('BANKER IS DISABLED HERE');
  });

  it('pays the documented rewards and reports a cleared set', () => {
    expect(challengeReward('underdog').tokens).toBe(2);
    expect(challengeReward('lowvar').shields).toBe(1);
    expect(challengeReward('sweep').badge).toBe('sweeper');
    expect(allCleared(['derby', 'underdog', 'sweep', 'lowvar'])).toBe(true);
    expect(allCleared(['derby'])).toBe(false);
  });
});
