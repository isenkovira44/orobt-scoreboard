import { Coins, Home, RotateCcw, TrendingUp } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { ASSETS } from '../assets';
import { CrestImage } from '../components/CrestImage';
import { InfoBanner } from '../components/InfoBanner';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenShell } from '../components/ScreenShell';
import { SecondaryButton } from '../components/SecondaryButton';
import { StatCardRow } from '../components/StatCard';
import { TopBar } from '../components/TopBar';
import { SCREEN_W, TOP_UP_AMOUNT } from '../constants/config';
import { THEME, NUM } from '../constants/theme';
import { badgeById } from '../game/collection';
import { OUTCOME_LABELS } from '../game/odds';
import { SaveBlob } from '../game/persistence';
import { RoundSummary } from '../hooks/useGameState';
import { formatDelta, formatPercent, formatSP } from '../utils/format';

type Props = {
  summary: RoundSummary;
  save: SaveBlob;
  canTopUp: boolean;
  onTopUp: () => void;
  onAgain: () => void;
  onMenu: () => void;
  onProgress: () => void;
  onCollection: () => void;
};

const CONFETTI = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

function Confetti({ reduceMotion }: { reduceMotion: boolean }) {
  const drop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      return;
    }
    const anim = Animated.timing(drop, { toValue: 1, duration: 900, useNativeDriver: true });
    anim.start();
    return () => {
      anim.stop();
    };
  }, [drop, reduceMotion]);

  if (reduceMotion) {
    return null;
  }

  const translateY = drop.interpolate({ inputRange: [0, 1], outputRange: [-40, 320] });
  const opacity = drop.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.confetti, { opacity, transform: [{ translateY }] }]}>
      <Svg width={SCREEN_W} height={80}>
        {CONFETTI.map(i => (
          <Rect
            key={i}
            x={(i * SCREEN_W) / CONFETTI.length + 6}
            y={(i % 4) * 16}
            width={6}
            height={12}
            rx={2}
            fill={i % 3 === 0 ? '#00E27A' : i % 3 === 1 ? '#A29BFE' : '#E0B15C'}
          />
        ))}
      </Svg>
    </Animated.View>
  );
}

export function ResultScreen({
  summary,
  save,
  canTopUp,
  onTopUp,
  onAgain,
  onMenu,
  onProgress,
  onCollection,
}: Props) {
  const reduceMotion = save.settings.reduceMotion;
  const win = summary.outcome === 'landed' || summary.outcome === 'banker';
  const variant = win ? 'win' : summary.outcome === 'cashed' ? 'neutral' : 'lose';

  const headScale = useRef(new Animated.Value(0.9)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    Animated.spring(headScale, {
      toValue: 1,
      tension: 60,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [headScale]);

  useEffect(() => {
    if (win || reduceMotion) {
      return;
    }
    const anim = Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 40, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 40, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 1, duration: 40, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]);
    anim.start();
    return () => {
      anim.stop();
    };
  }, [win, shake, reduceMotion]);

  useEffect(() => {
    const target = summary.delta;
    if (reduceMotion) {
      setShown(target);
      return;
    }
    const started = Date.now();
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - started) / 700);
      setShown(Math.round(target * t));
      if (t >= 1) {
        clearInterval(id);
      }
    }, 40);
    return () => {
      clearInterval(id);
    };
  }, [summary.delta, reduceMotion]);

  const statItems = useMemo(() => {
    const items = [];
    if (summary.legCount > 0) {
      items.push({
        key: 'hits',
        value: summary.hits + '/' + summary.legCount,
        label: 'HITS',
        valueColor: THEME.colors.primary,
      });
      items.push({
        key: 'accuracy',
        value: formatPercent(summary.accuracy),
        label: 'ACCURACY',
        valueColor: THEME.colors.gold,
      });
    }
    if (summary.xpGained > 0) {
      items.push({
        key: 'ap',
        value: '+' + summary.xpGained,
        label: 'ANALYST PTS',
        valueColor: THEME.colors.secondary,
      });
    }
    return items;
  }, [summary]);

  const unlockedBadge = summary.unlocked.length > 0 ? badgeById(summary.unlocked[0]) : undefined;
  const shakeX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-4, 4] });

  return (
    <ScreenShell variant={variant}>
      <TopBar
        title="SLIP SETTLED"
        subtitle={'MATCHDAY ' + Math.max(1, save.matchday - 1)}
        right={
          <View style={styles.balanceBox}>
            <Coins size={16} strokeWidth={THEME.icon.stroke} color={THEME.colors.primary} />
            <Text style={styles.balanceText}>{formatSP(save.balance)} SP</Text>
          </View>
        }
      />

      {win ? <Confetti reduceMotion={reduceMotion} /> : null}

      <View style={styles.body}>
        <View style={styles.headlineBlock}>
          <View style={styles.ruleRow}>
            <View style={styles.rule} />
            <View style={styles.rule} />
          </View>
          <Animated.Text style={[styles.headline, { transform: [{ scale: headScale }] }]}>
            {summary.headline}
          </Animated.Text>
          <Text
            style={[
              styles.delta,
              { color: summary.delta >= 0 ? THEME.colors.primary : THEME.colors.miss },
            ]}>
            {formatDelta(shown)}
          </Text>
        </View>

        <Animated.View style={[styles.legList, { transform: [{ translateX: shakeX }] }]}>
          {summary.legs.map(leg => {
            const fixture = summary.fixtures.find(f => f.id === leg.fixtureId);
            const result = summary.results.find(r => r.fixtureId === leg.fixtureId);
            if (!fixture) {
              return null;
            }
            const missed = !!result && !result.hit;
            return (
              <View
                key={leg.fixtureId}
                style={[styles.legRow, missed ? styles.legRowMissed : null]}>
                <CrestImage crestIndex={fixture.homeCrest} size={20} />
                <Text style={styles.legTeams} numberOfLines={1}>
                  {fixture.homeShort} vs {fixture.awayShort}
                </Text>
                <Text style={styles.legScore}>
                  {result ? result.homeGoals + ' - ' + result.awayGoals : 'NOT SETTLED'}
                </Text>
                <Text
                  style={[
                    styles.legPick,
                    { color: !result ? THEME.colors.textMuted : result.hit ? THEME.colors.primary : THEME.colors.miss },
                  ]}>
                  {OUTCOME_LABELS[leg.outcome]} {result ? (result.hit ? '✓' : '✗') : '·'}
                </Text>
              </View>
            );
          })}
        </Animated.View>

        <StatCardRow items={statItems} />

        {unlockedBadge ? (
          <View style={styles.bannerSlot}>
            <InfoBanner
              tone="unlock"
              text={'BADGE UNLOCKED — ' + unlockedBadge.name}
              onPress={onCollection}
            />
          </View>
        ) : null}

        {canTopUp ? (
          <View style={styles.bannerSlot}>
            <InfoBanner
              tone="warning"
              text={'OUT OF POINTS · TAP TO CLAIM ' + TOP_UP_AMOUNT + ' SP TOP-UP'}
              onPress={onTopUp}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Image source={ASSETS.buttonRect} style={styles.footerPlate} resizeMode="contain" />
        <PrimaryButton
          label="PLAY AGAIN"
          onPress={onAgain}
          height={60}
          icon={<RotateCcw size={20} strokeWidth={2} color={THEME.colors.onPrimary} />}
        />
        <View style={styles.secondaryRow}>
          <View style={styles.secondarySlot}>
            <SecondaryButton
              label="PROGRESS"
              onPress={onProgress}
              height={48}
              icon={
                <TrendingUp size={20} strokeWidth={THEME.icon.stroke} color={THEME.colors.text} />
              }
            />
          </View>
          <View style={styles.secondarySlot}>
            <SecondaryButton
              label="MENU"
              onPress={onMenu}
              height={48}
              icon={<Home size={20} strokeWidth={THEME.icon.stroke} color={THEME.colors.text} />}
            />
          </View>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  balanceBox: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: THEME.colors.fill,
    borderWidth: 1,
    borderColor: 'rgba(0,226,122,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.primary,
    ...NUM,
  },
  confetti: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 12,
  },
  headlineBlock: {
    alignItems: 'center',
    paddingTop: 4,
  },
  ruleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  rule: {
    width: 40,
    height: 2,
    borderRadius: 1,
    backgroundColor: THEME.colors.primary,
  },
  headline: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: THEME.colors.text,
    textAlign: 'center',
  },
  delta: {
    marginTop: 8,
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '900',
    ...NUM,
  },
  legList: {
    gap: 6,
  },
  legRow: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.hairline,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legRowMissed: {
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.miss,
  },
  legTeams: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: THEME.colors.text,
  },
  legScore: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.textSecondary,
    ...NUM,
  },
  legPick: {
    width: 36,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '800',
  },
  bannerSlot: {
    width: '100%',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 12,
    gap: 10,
  },
  footerPlate: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    height: 48,
    width: undefined,
    opacity: 0.16,
    borderRadius: 14,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondarySlot: {
    flex: 1,
  },
});


