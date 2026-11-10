import { Eye, Lock, Zap } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ASSETS } from '../assets';
import { BalancePill } from '../components/BalancePill';
import { Chip } from '../components/Chip';
import { FixtureCard } from '../components/FixtureCard';
import { InfoBanner } from '../components/InfoBanner';
import { PausePopup } from '../components/PausePopup';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenShell } from '../components/ScreenShell';
import { SecondaryButton } from '../components/SecondaryButton';
import { StatStrip } from '../components/StatStrip';
import { TopBar } from '../components/TopBar';
import { DAILY_STAKE, MIN_LEGS, STAKES } from '../constants/config';
import { THEME, NUM } from '../constants/theme';
import { ChallengeId, challengeById } from '../game/challenges';
import { Fixture } from '../game/fixtureGenerator';

import { SaveBlob } from '../game/persistence';
import { cashOutValue, canCashOut } from '../game/settlement';
import { suggestedBanker, validateSlip } from '../game/slip';
import { MatchdayMode, useMatchday } from '../hooks/useMatchday';
import { RoundInput } from '../hooks/useGameState';
import { useSettings } from '../hooks/useSettings';
import { formatSP } from '../utils/format';

type Props = {
  save: SaveBlob;
  mode: MatchdayMode;
  challenge: ChallengeId | null;
  onBack: () => void;
  onPlaceStake: (stake: number) => void;
  onFinish: (input: RoundInput) => void;
};

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

export function GameScreen({ save, mode, challenge, onBack, onPlaceStake, onFinish }: Props) {
  const view = useSettings(save.settings);
  const [stake, setStake] = useState<number>(mode === 'daily' ? DAILY_STAKE : STAKES[1]);
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(enter, {
      toValue: 1,
      duration: view.duration(240),
      useNativeDriver: true,
    });
    anim.start();
    return () => {
      anim.stop();
    };
  }, [enter, view]);

  const board = useMatchday({
    clubs: save.clubs,
    matchday: save.matchday,
    mode,
    challenge,
    stake,
    revealMs: view.revealMs,
    onFinish,
  });

  const {
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
  } = board;

  const locked = phase !== 'idle';
  const validation = useMemo(
    () => validateSlip(legs, stake, save.balance, challenge, banker),
    [legs, stake, save.balance, challenge, banker],
  );

  const hintedBanker = useMemo(
    () => (view.bankerHint && !banker && legs.length >= 2 ? suggestedBanker(legs) : null),
    [view.bankerHint, banker, legs],
  );

  const settledIds = useMemo(() => settled.map(r => r.fixtureId), [settled]);
  const activeId = useMemo(() => {
    if (phase !== 'settling') {
      return null;
    }
    const next = legs[settled.length];
    return next ? next.fixtureId : null;
  }, [phase, legs, settled.length]);

  const cashValue = cashOutValue(stake, settled);
  const cashAvailable = phase === 'settling' && canCashOut(settled, legs.length) && cashValue > 0;

  const handleLock = useCallback(() => {
    if (!validation.ok) {
      return;
    }
    onPlaceStake(stake);
    lockSlip();
  }, [validation.ok, onPlaceStake, stake, lockSlip]);

  const handleBack = useCallback(() => {
    abandon();
    onBack();
  }, [abandon, onBack]);

  const handleMenuFromPause = useCallback(() => {
    abandon();
    onBack();
  }, [abandon, onBack]);

  const renderItem = useCallback(
    (info: ListRenderItemInfo<Fixture>) => {
      const fixture = info.item;
      const index = settledIds.indexOf(fixture.id);
      const result = index >= 0 ? settled[index] : null;
      return (
        <FixtureCard
          fixture={fixture}
          pick={picks[fixture.id]}
          isBanker={banker === fixture.id}
          insightRevealed={revealedIds.indexOf(fixture.id) >= 0}
          insightArmed={insightArmed}
          locked={locked}
          result={result}
          settledNow={!!result}
          active={activeId === fixture.id}
          format={view.multiplierFormat}
          challenge={challenge}
          reduceMotion={save.settings.reduceMotion}
          bankerHinted={hintedBanker === fixture.id}
          onPick={togglePick}
          onBanker={toggleBanker}
          onReveal={revealInsight}
        />
      );
    },
    [
      picks,
      banker,
      revealedIds,
      insightArmed,
      locked,
      settled,
      settledIds,
      activeId,
      view.multiplierFormat,
      challenge,
      save.settings.reduceMotion,
      hintedBanker,
      togglePick,
      toggleBanker,
      revealInsight,
    ],
  );

  const keyExtractor = useCallback((item: Fixture) => item.id, []);

  const translate = enter.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });
  const challengeName = challenge ? challengeById(challenge).title : null;

  return (
    <ScreenShell variant="game">
      <Animated.View
        pointerEvents="box-none"
        style={[styles.root, { opacity: enter, transform: [{ translateY: translate }] }]}>
        <TopBar
          title={mode === 'daily' ? 'DAILY SLATE' : 'MATCHDAY ' + save.matchday}
          subtitle="OROBET PRIME LEAGUE"
          onBack={handleBack}
          right={
            phase === 'settling' ? (
              <Pressable
                onPress={pause}
                hitSlop={HIT}
                accessibilityRole="button"
                accessibilityLabel="PAUSE"
                style={styles.pausePressable}>
                <View style={styles.pauseTile}>
                  <Image
                    source={ASSETS.iconPause}
                    style={styles.pauseIcon}
                    resizeMode="contain"
                  />
                </View>
              </Pressable>
            ) : (
              <BalancePill value={save.balance} reduceMotion={save.settings.reduceMotion} />
            )
          }
        />

        <View style={styles.boardArea}>
          {board.slate.fallback ? (
            <View style={styles.bannerSlot}>
              <InfoBanner tone="warning" text="BACKUP SLATE LOADED" />
            </View>
          ) : null}

          {challengeName ? (
            <View style={styles.modeChip}>
              <Text style={styles.modeChipText}>{challengeName}</Text>
            </View>
          ) : null}

          {!locked && save.matchday <= 3 ? (
            <Text style={styles.hint}>HOLD A PICK TO SET BANKER (x1.5)</Text>
          ) : null}

          <FlatList
            data={fixtures}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={5}
          />
        </View>

        <StatStrip
          legs={legs.length}
          multiplier={multiplier}
          toWin={potential}
          bankerActive={!!banker}
        />

        <View style={styles.controls}>
          {!locked ? (
            <View style={styles.stakeRow}>
              {STAKES.map(value => (
                <Chip
                  key={value}
                  label={String(value)}
                  active={stake === value}
                  disabled={mode === 'daily'}
                  onPress={() => setStake(value)}
                />
              ))}
              <Chip
                label="MAX"
                active={stake === save.balance && save.balance > 0}
                disabled={mode === 'daily' || save.balance <= 0}
                onPress={() => setStake(save.balance)}
              />
            </View>
          ) : null}

          {!locked && legs.length < MIN_LEGS ? (
            <View style={styles.insightSlot}>
              <SecondaryButton
                label="DEAL QUICK SLIP"
                tone="neutral"
                height={44}
                icon={
                  <Zap size={20} strokeWidth={THEME.icon.stroke} color={THEME.colors.text} />
                }
                onPress={quickSlip}
              />
            </View>
          ) : null}

          {!locked && save.tokens > 0 ? (
            <View style={styles.insightSlot}>
              <SecondaryButton
                label={
                  insightArmed
                    ? 'TAP A FIXTURE TO REVEAL'
                    : 'INSIGHT x' + save.tokens + ' — SEE HIDDEN STATS'
                }
                tone="violet"
                height={44}
                icon={
                  <Eye size={20} strokeWidth={THEME.icon.stroke} color={THEME.colors.secondary} />
                }
                onPress={armInsight}
              />
            </View>
          ) : null}

          {!locked ? (
            <PrimaryButton
              label={validation.ok ? 'LOCK SLIP · GO' : validation.reason}
              disabled={!validation.ok}
              onPress={handleLock}
              height={60}
              icon={<Lock size={20} strokeWidth={2} color={THEME.colors.onPrimary} />}
            />
          ) : cashAvailable ? (
            <SecondaryButton
              label={'CASH OUT ' + formatSP(cashValue) + ' SP'}
              tone="gold"
              height={56}
              onPress={cashOut}
            />
          ) : (
            <View style={styles.settlingRow}>
              <Text style={styles.settlingText}>
                SETTLING LEG {Math.min(settled.length + 1, legs.length)} OF {legs.length}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>

      {paused ? <PausePopup onResume={resume} onMenu={handleMenuFromPause} /> : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  pausePressable: {
    width: 48,
    height: 48,
  },
  pauseTile: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: THEME.colors.fill,
    borderWidth: 1,
    borderColor: THEME.colors.hairlineStrong,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pauseIcon: {
    width: 24,
    height: 24,
  },
  boardArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  bannerSlot: {
    marginBottom: 8,
  },
  modeChip: {
    alignSelf: 'flex-start',
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(162,155,254,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(162,155,254,0.45)',
    justifyContent: 'center',
    marginBottom: 6,
  },
  modeChipText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: THEME.colors.secondary,
  },
  hint: {
    marginBottom: 6,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: THEME.colors.textMuted,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 4,
  },
  controls: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 10,
  },
  stakeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  insightSlot: {
    width: '100%',
  },
  settlingRow: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: THEME.colors.fill,
    borderWidth: 1,
    borderColor: THEME.colors.hairline,
  },
  settlingText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: THEME.colors.textSecondary,
    ...NUM,
  },
});


