import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MAX_LEGS, MIN_LEGS, REVEAL_MS_DECIDED } from '../constants/config';
import { ChallengeId, challengeById } from '../game/challenges';
import { dailySlate, dayIndex } from '../game/dailyMode';
import { Fixture, Slate, generateSlate } from '../game/fixtureGenerator';
import { Club } from '../game/league';
import { Outcome } from '../game/odds';
import { mulberry32 } from '../game/rng';
import { LegResult, isDecided, settleLegs } from '../game/settlement';
import { Leg, legsFromPicks, totalMultiplier, toWin } from '../game/slip';
import { RoundInput } from './useGameState';

export type MatchdayMode = 'normal' | 'daily' | 'challenge';
export type MatchdayPhase = 'idle' | 'settling';

type Params = {
  clubs: Club[];
  matchday: number;
  mode: MatchdayMode;
  challenge: ChallengeId | null;
  stake: number;
  revealMs: number;
  onFinish: (input: RoundInput) => void;
};

export function useMatchday(params: Params) {
  const { clubs, matchday, mode, challenge, revealMs, onFinish } = params;

  const slate: Slate = useMemo(() => {
    if (mode === 'daily') {
      return dailySlate(clubs, dayIndex());
    }
    const regionOnly =
      challenge && challengeById(challenge).regionOnly ? clubs[0].region : undefined;
    return generateSlate(clubs, matchday, regionOnly ? { regionOnly } : undefined);
  }, [clubs, matchday, mode, challenge]);

  const fixtures: Fixture[] = slate.fixtures;

  const [picks, setPicks] = useState<Record<string, Outcome | undefined>>({});
  const [banker, setBanker] = useState<string | null>(null);
  const [phase, setPhase] = useState<MatchdayPhase>('idle');
  const [settled, setSettled] = useState<LegResult[]>([]);
  const [insightArmed, setInsightArmed] = useState(false);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [paused, setPaused] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const plannedRef = useRef<LegResult[]>([]);
  const legsRef = useRef<Leg[]>([]);
  const indexRef = useRef(0);
  const finishedRef = useRef(false);
  const bankerRef = useRef<string | null>(null);
  const stakeRef = useRef(params.stake);
  const usedInsightRef = useRef(false);
  const revealMsRef = useRef(revealMs);

  const picksRef = useRef(picks);

  bankerRef.current = banker;
  stakeRef.current = params.stake;
  revealMsRef.current = revealMs;
  picksRef.current = picks;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      finishedRef.current = true;
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const legs = useMemo(() => legsFromPicks(fixtures, picks), [fixtures, picks]);
  const multiplier = useMemo(() => totalMultiplier(legs, banker), [legs, banker]);
  const potential = useMemo(() => toWin(params.stake, multiplier), [params.stake, multiplier]);

  const togglePick = useCallback(
    (fixtureId: string, outcome: Outcome) => {
      setPicks(prev => {
        const current = prev[fixtureId];
        const next = { ...prev };
        if (current === outcome) {
          delete next[fixtureId];
          return next;
        }
        if (current === undefined && Object.keys(prev).length >= MAX_LEGS) {
          return prev;
        }
        next[fixtureId] = outcome;
        return next;
      });
      setBanker(prev => (prev === fixtureId ? null : prev));
    },
    [],
  );

  const toggleBanker = useCallback((fixtureId: string) => {
    if (picksRef.current[fixtureId] === undefined) {
      return;
    }
    setBanker(cur => (cur === fixtureId ? null : fixtureId));
  }, []);

  /**
   * One-tap favourites slip: takes the model's strongest legal outcome on the first
   * MIN_LEGS fixtures. A fast opening for a player who trusts the ratings, and the
   * shortest route from an empty board to a lockable slip.
   */
  const quickSlip = useCallback(() => {
    if (phase !== 'idle') {
      return;
    }
    const rule = challenge ? challengeById(challenge) : null;
    const next: Record<string, Outcome | undefined> = {};
    let taken = 0;
    fixtures.forEach(fixture => {
      if (taken >= MIN_LEGS) {
        return;
      }
      let best: Outcome | null = null;
      ([0, 1, 2] as Outcome[]).forEach(outcome => {
        if (rule && rule.blockPick(fixture.odds[outcome])) {
          return;
        }
        if (best === null || fixture.probabilities[outcome] > fixture.probabilities[best]) {
          best = outcome;
        }
      });
      if (best !== null) {
        next[fixture.id] = best;
        taken += 1;
      }
    });
    setBanker(null);
    setPicks(next);
  }, [challenge, fixtures, phase]);

  const armInsight = useCallback(() => {
    setInsightArmed(prev => !prev);
  }, []);

  const revealInsight = useCallback((fixtureId: string) => {
    usedInsightRef.current = true;
    setRevealedIds(prev => (prev.indexOf(fixtureId) >= 0 ? prev : prev.concat(fixtureId)));
    setInsightArmed(false);
  }, []);

  const finish = useCallback(
    (results: LegResult[], cashed: boolean) => {
      if (finishedRef.current) {
        return;
      }
      finishedRef.current = true;
      clearTimer();
      onFinish({
        fixtures,
        legs: legsRef.current,
        results,
        stake: stakeRef.current,
        bankerId: bankerRef.current,
        cashed,
        challenge,
        usedInsight: usedInsightRef.current,
        daily: mode === 'daily',
      });
    },
    [challenge, clearTimer, fixtures, mode, onFinish],
  );

  const step = useCallback(() => {
    const planned = plannedRef.current;
    const i = indexRef.current;
    if (i >= planned.length) {
      finish(planned, false);
      return;
    }
    const nextSettled = planned.slice(0, i + 1);
    indexRef.current = i + 1;
    setSettled(nextSettled);
    if (indexRef.current >= planned.length) {
      timerRef.current = setTimeout(() => finish(planned, false), 520);
      return;
    }
    const delay = isDecided(nextSettled) ? REVEAL_MS_DECIDED : revealMsRef.current;
    timerRef.current = setTimeout(step, delay);
  }, [finish]);

  const lockSlip = useCallback(() => {
    if (phase !== 'idle' || legs.length === 0) {
      return;
    }
    const rng = mulberry32((slate.seed ^ 0x9e3779b9) >>> 0);
    const planned = settleLegs(fixtures, legs, rng);
    plannedRef.current = planned;
    legsRef.current = legs;
    indexRef.current = 0;
    finishedRef.current = false;
    setSettled([]);
    setPhase('settling');
    setInsightArmed(false);
    timerRef.current = setTimeout(step, revealMsRef.current);
  }, [fixtures, legs, phase, slate.seed, step]);

  const cashOut = useCallback(() => {
    clearTimer();
    finish(plannedRef.current.slice(0, indexRef.current), true);
  }, [clearTimer, finish]);

  const pause = useCallback(() => {
    clearTimer();
    setPaused(true);
  }, [clearTimer]);

  const resume = useCallback(() => {
    setPaused(false);
    if (phase === 'settling' && !finishedRef.current) {
      timerRef.current = setTimeout(step, revealMsRef.current);
    }
  }, [phase, step]);

  const abandon = useCallback(() => {
    finishedRef.current = true;
    clearTimer();
  }, [clearTimer]);

  return {
    slate,
    fixtures,
    picks,
    legs,
    banker,
    phase,
    settled,
    paused,
    insightArmed,
    revealedIds,
    multiplier,
    potential,
    togglePick,
    quickSlip,
    toggleBanker,
    armInsight,
    revealInsight,
    lockSlip,
    cashOut,
    pause,
    resume,
    abandon,
  };
}
