import { useCallback, useRef, useState } from 'react';
import { TOP_UP_AMOUNT, TOP_UP_THRESHOLD } from '../constants/config';
import { ChallengeId, challengeReward } from '../game/challenges';
import { BadgeContext, evaluateBadges } from '../game/collection';
import { dayIndex } from '../game/dailyMode';
import { Fixture } from '../game/fixtureGenerator';
import { MatchOutcomeRecord, driftLeague } from '../game/league';
import {
  HistoryEntry,
  SaveBlob,
  Settings,
  loadSave,
  pushHistory,
  resetSave,
  saveSave,
} from '../game/persistence';
import { apEarned, levelForXp } from '../game/progression';
import { LegResult, SlipOutcome, cashOutValue, headlineFor, outcomeFor, payoutFor } from '../game/settlement';
import { Leg } from '../game/slip';
import { applyStreak } from '../game/streak';
import { tokensEarned } from '../game/insight';

export type RoundInput = {
  fixtures: Fixture[];
  legs: Leg[];
  results: LegResult[];
  stake: number;
  bankerId: string | null;
  cashed: boolean;
  challenge: ChallengeId | null;
  usedInsight: boolean;
  daily: boolean;
};

export type RoundSummary = {
  outcome: SlipOutcome;
  headline: string;
  results: LegResult[];
  fixtures: Fixture[];
  legs: Leg[];
  stake: number;
  payout: number;
  delta: number;
  hits: number;
  legCount: number;
  accuracy: number;
  xpGained: number;
  unlocked: string[];
  bankerId: string | null;
  cashed: boolean;
  challengeCleared: ChallengeId | null;
  shieldUsed: boolean;
};

export function useGameState() {
  const [save, setSave] = useState<SaveBlob>(() => loadSave());
  const saveRef = useRef(save);
  saveRef.current = save;

  const commit = useCallback((next: SaveBlob) => {
    saveRef.current = next;
    saveSave(next);
    setSave(next);
  }, []);

  /** The stake leaves the balance when the slip is locked. */
  const placeStake = useCallback(
    (stake: number) => {
      const cur = saveRef.current;
      commit({ ...cur, balance: Math.max(0, cur.balance - stake) });
    },
    [commit],
  );

  const spendInsight = useCallback(() => {
    const cur = saveRef.current;
    if (cur.tokens <= 0) {
      return;
    }
    commit({ ...cur, tokens: cur.tokens - 1 });
  }, [commit]);

  const setSetting = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      const cur = saveRef.current;
      commit({ ...cur, settings: { ...cur.settings, [key]: value } });
    },
    [commit],
  );

  const claimTopUp = useCallback(() => {
    const cur = saveRef.current;
    const today = dayIndex();
    if (cur.balance >= TOP_UP_THRESHOLD || cur.lastTopUpIndex === today) {
      return;
    }
    commit({ ...cur, balance: cur.balance + TOP_UP_AMOUNT, lastTopUpIndex: today });
  }, [commit]);

  const canTopUp = save.balance < TOP_UP_THRESHOLD && save.lastTopUpIndex !== dayIndex();

  const resetAll = useCallback(() => {
    const fresh = resetSave();
    saveRef.current = fresh;
    setSave(fresh);
  }, []);

  /** Applies a settled matchday to the save blob and returns what Result renders. */
  const commitRound = useCallback(
    (input: RoundInput): RoundSummary => {
      const cur = saveRef.current;
      const legCount = input.legs.length;
      const settled = input.results;
      const hits = settled.filter(r => r.hit).length;
      const accuracy = legCount === 0 ? 0 : hits / legCount;
      const bankerResult = input.bankerId
        ? settled.find(r => r.fixtureId === input.bankerId)
        : undefined;
      const bankerHit = !!(bankerResult && bankerResult.hit);

      const payout = input.cashed
        ? cashOutValue(input.stake, settled)
        : payoutFor(input.stake, input.legs, input.bankerId, settled);

      const outcome = outcomeFor(settled, input.bankerId, input.cashed);

      const reward = input.challenge ? challengeReward(input.challenge) : null;
      const sweepOk = input.challenge !== 'sweep' || (hits === 5 && legCount === 5);
      const challengeCleared =
        input.challenge && accuracy >= 0.6 && sweepOk ? input.challenge : null;

      const streakNext = applyStreak(
        {
          streakMultiplier: cur.streakMultiplier,
          dailyStreak: cur.dailyStreak,
          shields: cur.shields,
        },
        accuracy,
      );

      const xpGained = apEarned(
        hits,
        cur.streakMultiplier,
        bankerHit,
        challengeCleared && reward ? reward.accuracyBonus : 0,
      );
      const xp = cur.xp + xpGained;
      const level = levelForXp(xp);

      const records: MatchOutcomeRecord[] = settled.map(r => {
        const fx = input.fixtures.find(f => f.id === r.fixtureId) || input.fixtures[0];
        return { homeId: fx.homeId, awayId: fx.awayId, outcome: r.actual };
      });

      const longShotHit = settled.some(r => r.hit && r.odds >= 4);
      const slipsPlayed = cur.history.length + 1;

      const badgeCtx: BadgeContext = {
        hits,
        legs: legCount,
        accuracy,
        payout,
        bankerHit,
        cashed: input.cashed,
        dailyStreak: streakNext.dailyStreak,
        level,
        slipsPlayed,
        challengeDone: challengeCleared,
        usedInsight: input.usedInsight,
        longShotHit,
      };
      const unlocked = evaluateBadges(cur.badges, badgeCtx);

      const entry: HistoryEntry = {
        matchday: cur.matchday,
        hits,
        legs: legCount,
        accuracy,
        stake: input.stake,
        payout,
        outcome,
        homePicks: input.legs.filter(l => l.outcome === 0).length,
        drawPicks: input.legs.filter(l => l.outcome === 1).length,
        bankerSet: !!input.bankerId,
        bankerHit,
      };

      const challengesDone: ChallengeId[] =
        challengeCleared && cur.challengesDone.indexOf(challengeCleared) < 0
          ? cur.challengesDone.concat(challengeCleared)
          : cur.challengesDone;

      const next: SaveBlob = {
        ...cur,
        balance: cur.balance + payout,
        xp,
        level,
        matchday: cur.matchday + 1,
        streakMultiplier: streakNext.streakMultiplier,
        dailyStreak: streakNext.dailyStreak,
        shields: streakNext.shields + (challengeCleared && reward ? reward.shields : 0),
        tokens:
          cur.tokens +
          tokensEarned(bankerHit, streakNext.dailyStreak) +
          (challengeCleared && reward ? reward.tokens : 0),
        badges: cur.badges.concat(unlocked),
        history: pushHistory(cur.history, entry),
        challengesDone,
        clubs: driftLeague(cur.clubs, records),
        lastDailyIndex: input.daily ? dayIndex() : cur.lastDailyIndex,
      };
      commit(next);

      return {
        outcome,
        headline: headlineFor(outcome),
        results: settled,
        fixtures: input.fixtures,
        legs: input.legs,
        stake: input.stake,
        payout,
        delta: payout - input.stake,
        hits,
        legCount,
        accuracy,
        xpGained,
        unlocked,
        bankerId: input.bankerId,
        cashed: input.cashed,
        challengeCleared,
        shieldUsed: streakNext.shieldUsed,
      };
    },
    [commit],
  );

  return {
    save,
    placeStake,
    spendInsight,
    setSetting,
    claimTopUp,
    canTopUp,
    resetAll,
    commitRound,
  };
}
