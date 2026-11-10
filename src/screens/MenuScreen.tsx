import {
  BookOpen,
  CalendarCheck,
  Medal,
  Settings as SettingsIcon,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ASSETS } from '../assets';
import { BalancePill } from '../components/BalancePill';
import { BentoTile } from '../components/BentoTile';
import { InfoBanner } from '../components/InfoBanner';
import { RulesSheet } from '../components/RulesSheet';
import { ScreenShell } from '../components/ScreenShell';
import { TopBar } from '../components/TopBar';
import { TOP_UP_AMOUNT } from '../constants/config';
import { THEME, NUM } from '../constants/theme';
import { CHALLENGES, ChallengeId } from '../game/challenges';
import { BADGES } from '../game/collection';
import { dayIndex } from '../game/dailyMode';
import { SaveBlob } from '../game/persistence';
import { levelProgress } from '../game/progression';
import { summarise } from '../game/progressStats';
import { usePressScale } from '../hooks/usePressScale';
import { formatPercent } from '../utils/format';

type Props = {
  save: SaveBlob;
  canTopUp: boolean;
  onTopUp: () => void;
  onPlay: () => void;
  onOpen: (screen: 'daily' | 'challenge' | 'progress' | 'collection' | 'settings') => void;
};

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

function PlayTile({ onPress }: { onPress: () => void }) {
  const press = usePressScale(0.97);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel="START MATCHDAY"
      style={styles.playPressable}>
      <Animated.View style={[styles.playAnimated, press.style]}>
        <LinearGradient
          colors={['#00E27A', '#00B964']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.playTile}>
          <View style={styles.playRow}>
            <View style={styles.playIconBox}>
              <Trophy size={24} strokeWidth={THEME.icon.stroke} color={THEME.colors.onPrimary} />
            </View>
            <Text style={styles.playLabel}>START MATCHDAY</Text>
          </View>
          <Text style={styles.playCaption}>5 FIXTURES · BUILD YOUR SLIP</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

export function MenuScreen({ save, canTopUp, onTopUp, onPlay, onOpen }: Props) {
  const [rulesOpen, setRulesOpen] = useState(false);
  const enter = useRef(new Animated.Value(0)).current;
  const row1 = useRef(new Animated.Value(0)).current;
  const row2 = useRef(new Animated.Value(0)).current;
  const row3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const steps = [enter, row1, row2, row3].map((value, index) =>
      Animated.timing(value, {
        toValue: 1,
        duration: save.settings.reduceMotion ? 120 : 260,
        delay: save.settings.reduceMotion ? 0 : index * 60,
        useNativeDriver: true,
      }),
    );
    const group = Animated.parallel(steps);
    group.start();
    return () => {
      group.stop();
    };
  }, [enter, row1, row2, row3, save.settings.reduceMotion]);

  const stats = useMemo(() => summarise(save.history), [save.history]);
  const level = useMemo(() => levelProgress(save.xp), [save.xp]);
  const activeChallenges = useMemo(
    () => CHALLENGES.filter(c => save.challengesDone.indexOf(c.id as ChallengeId) < 0).length,
    [save.challengesDone],
  );

  const dailyDone = save.lastDailyIndex === dayIndex();
  const dailySecondary = dailyDone
    ? 'DONE ✓'
    : save.dailyStreak > 0
    ? 'STREAK ' + save.dailyStreak
    : 'READY';

  const openDaily = useCallback(() => onOpen('daily'), [onOpen]);
  const openChallenge = useCallback(() => onOpen('challenge'), [onOpen]);
  const openProgress = useCallback(() => onOpen('progress'), [onOpen]);
  const openCollection = useCallback(() => onOpen('collection'), [onOpen]);
  const openSettings = useCallback(() => onOpen('settings'), [onOpen]);
  const openRules = useCallback(() => setRulesOpen(true), []);
  const closeRules = useCallback(() => setRulesOpen(false), []);

  const translate = (value: Animated.Value) =>
    value.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  return (
    <ScreenShell variant="menu">
      <TopBar
        title="OROBET SCOREBOARD"
        subtitle="PRIME LEAGUE TERMINAL"
        left={
          <View style={styles.homeTile}>
            <Image source={ASSETS.iconHome} style={styles.homeIcon} resizeMode="contain" />
          </View>
        }
        right={<BalancePill value={save.balance} reduceMotion={save.settings.reduceMotion} />}
      />

      <View style={styles.grid}>
        {canTopUp ? (
          <InfoBanner
            tone="warning"
            text={'OUT OF POINTS · TAP TO CLAIM ' + TOP_UP_AMOUNT + ' SP TOP-UP'}
            onPress={onTopUp}
          />
        ) : null}

        <Animated.View
          pointerEvents="box-none"
          style={{ opacity: enter, transform: [{ translateY: translate(enter) }] }}>
          <PlayTile onPress={onPlay} />
        </Animated.View>

        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.row,
            { opacity: row1, transform: [{ translateY: translate(row1) }] },
          ]}>
          <View style={styles.cell}>
            <BentoTile
              title="DAILY MODE"
              secondary={dailySecondary}
              accent={THEME.colors.primary}
              height={100}
              icon={
                <CalendarCheck
                  size={20}
                  strokeWidth={THEME.icon.stroke}
                  color={THEME.colors.primary}
                />
              }
              onPress={openDaily}
            />
          </View>
          <View style={styles.cell}>
            <BentoTile
              title="CHALLENGE"
              secondary={activeChallenges + ' / ' + CHALLENGES.length + ' ACTIVE'}
              accent={THEME.colors.secondary}
              height={100}
              icon={
                <Target size={20} strokeWidth={THEME.icon.stroke} color={THEME.colors.secondary} />
              }
              onPress={openChallenge}
            />
          </View>
        </Animated.View>

        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.row,
            { opacity: row2, transform: [{ translateY: translate(row2) }] },
          ]}>
          <View style={styles.cell}>
            <BentoTile
              title="PROGRESS"
              secondary={
                stats.slips > 0 ? 'ACCURACY ' + formatPercent(stats.accuracy) : 'NO DATA YET'
              }
              accent={THEME.colors.gold}
              height={100}
              icon={
                <TrendingUp size={20} strokeWidth={THEME.icon.stroke} color={THEME.colors.gold} />
              }
              onPress={openProgress}
            />
          </View>
          <View style={styles.cell}>
            <BentoTile
              title="COLLECTION"
              secondary={save.badges.length + ' / ' + BADGES.length}
              accent={THEME.colors.secondary}
              height={100}
              icon={
                <Medal size={20} strokeWidth={THEME.icon.stroke} color={THEME.colors.secondary} />
              }
              onPress={openCollection}
            />
          </View>
        </Animated.View>

        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.row,
            { opacity: row3, transform: [{ translateY: translate(row3) }] },
          ]}>
          <View style={styles.cell}>
            <BentoTile
              title="SETTINGS"
              accent={THEME.colors.textSecondary}
              height={72}
              icon={
                <SettingsIcon
                  size={20}
                  strokeWidth={THEME.icon.stroke}
                  color={THEME.colors.textSecondary}
                />
              }
              onPress={openSettings}
            />
          </View>
          <View style={styles.cell}>
            <BentoTile
              title="HOW TO PLAY"
              accent={THEME.colors.textSecondary}
              height={72}
              icon={
                <BookOpen
                  size={20}
                  strokeWidth={THEME.icon.stroke}
                  color={THEME.colors.textSecondary}
                />
              }
              onPress={openRules}
            />
          </View>
        </Animated.View>

        <View style={styles.levelStrip}>
          <Text style={styles.levelLabel}>ANALYST LV.{level.level}</Text>
          <View style={styles.xpTrack}>
            <View
              style={[
                styles.xpFill,
                { flex: Math.max(0.03, Math.min(1, level.into / level.span)) },
              ]}
            />
            <View style={{ flex: Math.max(0, 1 - level.into / level.span) }} />
          </View>
          <Text style={styles.levelXp}>
            {level.into} / {level.span} XP
          </Text>
        </View>
      </View>

      {rulesOpen ? <RulesSheet onClose={closeRules} /> : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  homeTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: THEME.colors.fill,
    borderWidth: 1,
    borderColor: THEME.colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  homeIcon: {
    width: 28,
    height: 28,
  },
  grid: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  cell: {
    flex: 1,
  },
  playPressable: {
    width: '100%',
    height: 140,
  },
  playAnimated: {
    width: '100%',
    height: 140,
  },
  playTile: {
    width: '100%',
    height: 140,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  playRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  playIconBox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playLabel: {
    fontSize: 24,
    lineHeight: 24,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: THEME.colors.onPrimary,
  },
  playCaption: {
    marginTop: 12,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: 'rgba(6,19,12,0.72)',
  },
  levelStrip: {
    marginTop: 'auto',
    height: 56,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.hairline,
    borderRadius: 18,
  },
  levelLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: THEME.colors.text,
  },
  xpTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  xpFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.secondary,
  },
  levelXp: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: THEME.colors.textMuted,
    ...NUM,
  },
});
