import { Check, Eye, Flame, X as XMark } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { CARD_H, CARD_H_SETTLED, CARD_W, PICK_GAP } from '../constants/config';
import { THEME, NUM } from '../constants/theme';
import { ChallengeId } from '../game/challenges';
import { Fixture } from '../game/fixtureGenerator';
import { describeHidden } from '../game/insight';
import { OUTCOME_LABELS, Outcome } from '../game/odds';
import { LegResult } from '../game/settlement';
import { pickBlockedReason } from '../game/slip';
import { formatOdds } from '../utils/format';
import { CrestImage } from './CrestImage';
import { PickButton } from './PickButton';

type Props = {
  fixture: Fixture;
  pick: Outcome | undefined;
  isBanker: boolean;
  insightRevealed: boolean;
  insightArmed: boolean;
  locked: boolean;
  result: LegResult | null;
  settledNow: boolean;
  active: boolean;
  format: 'decimal' | 'chance';
  challenge: ChallengeId | null;
  reduceMotion: boolean;
  bankerHinted: boolean;
  onPick: (fixtureId: string, outcome: Outcome) => void;
  onBanker: (fixtureId: string) => void;
  onReveal: (fixtureId: string) => void;
};

const OUTCOMES: Outcome[] = [0, 1, 2];

function FormBar({ points, color }: { points: number; color: string }) {
  const ratio = Math.max(0.08, Math.min(1, points / 15));
  return (
    <View style={styles.formTrack}>
      <View style={[styles.formFill, { flex: ratio, backgroundColor: color }]} />
      <View style={{ flex: 1 - ratio }} />
    </View>
  );
}

function FixtureCardBase(props: Props) {
  const {
    fixture,
    pick,
    isBanker,
    insightRevealed,
    insightArmed,
    locked,
    result,
    settledNow,
    active,
    format,
    challenge,
    reduceMotion,
    bankerHinted,
    onPick,
    onBanker,
    onReveal,
  } = props;

  const height = useRef(new Animated.Value(CARD_H)).current;
  const pulse = useRef(new Animated.Value(0.35)).current;
  const scoreIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // height is a layout property, so the native driver is explicitly off here
    Animated.timing(height, {
      toValue: settledNow ? CARD_H_SETTLED : CARD_H,
      duration: reduceMotion ? 120 : 240,
      useNativeDriver: false,
    }).start();
  }, [settledNow, height, reduceMotion]);

  useEffect(() => {
    if (!settledNow) {
      return;
    }
    Animated.timing(scoreIn, {
      toValue: 1,
      duration: reduceMotion ? 120 : 240,
      useNativeDriver: true,
    }).start();
  }, [settledNow, scoreIn, reduceMotion]);

  useEffect(() => {
    if (!active || reduceMotion) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.3, duration: 350, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [active, pulse, reduceMotion]);

  const handleReveal = useCallback(() => {
    onReveal(fixture.id);
  }, [fixture.id, onReveal]);

  const borderColor = isBanker
    ? THEME.colors.gold
    : active
    ? THEME.colors.secondary
    : THEME.colors.hairline;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.card,
        { height, borderColor, borderWidth: active ? 2 : 1 },
      ]}>
      {settledNow && result ? (
        <Animated.View style={[styles.settledRow, { opacity: scoreIn }]} pointerEvents="box-none">
          <CrestImage crestIndex={fixture.homeCrest} size={22} />
          <Text style={styles.settledTeams} numberOfLines={1}>
            {fixture.homeShort} vs {fixture.awayShort}
          </Text>
          <Text style={styles.settledScore}>
            {result.homeGoals} - {result.awayGoals}
          </Text>
          <Text style={styles.settledPick}>PICK {OUTCOME_LABELS[result.outcome]}</Text>
          <View style={styles.settledIcon}>
            {result.hit ? (
              <Check size={18} strokeWidth={2} color={THEME.colors.primary} />
            ) : (
              <XMark size={18} strokeWidth={2} color={THEME.colors.miss} />
            )}
          </View>
        </Animated.View>
      ) : (
        <View style={styles.body} pointerEvents="box-none">
          <View style={styles.topRow} pointerEvents="none">
            <View style={styles.teamLeft}>
              <CrestImage crestIndex={fixture.homeCrest} size={26} />
              <Text style={styles.teamName} numberOfLines={1}>
                {fixture.homeShort}
              </Text>
            </View>
            <Text style={styles.vs}>vs</Text>
            <View style={styles.teamRight}>
              <Text style={styles.teamName} numberOfLines={1}>
                {fixture.awayShort}
              </Text>
              <CrestImage crestIndex={fixture.awayCrest} size={26} />
            </View>
          </View>

          <View style={styles.statRow} pointerEvents="none">
            <View style={styles.formCol}>
              <FormBar points={fixture.homeForm} color={THEME.colors.primary} />
              <FormBar points={fixture.awayForm} color={THEME.colors.secondary} />
            </View>
            <Text style={styles.statText} numberOfLines={1}>
              ATK {fixture.homeAtk} · DEF {fixture.homeDef}
            </Text>
            <Text style={styles.statText} numberOfLines={1}>
              H2H {fixture.h2h[0]}-{fixture.h2h[1]}-{fixture.h2h[2]}
            </Text>
          </View>

          {insightRevealed ? (
            <View style={styles.insightRow} pointerEvents="none">
              <Eye size={12} strokeWidth={THEME.icon.stroke} color={THEME.colors.secondary} />
              <Text style={styles.insightText} numberOfLines={1}>
                {describeHidden(fixture.homeHidden)}
              </Text>
            </View>
          ) : null}

          <View style={styles.pickRow}>
            {OUTCOMES.map(outcome => {
              const blocked = pickBlockedReason(fixture.odds[outcome], challenge);
              return (
                <PickButton
                  key={outcome}
                  fixtureId={fixture.id}
                  outcome={outcome}
                  letter={OUTCOME_LABELS[outcome]}
                  oddsText={formatOdds(fixture.odds[outcome], format)}
                  selected={pick === outcome}
                  isBanker={isBanker && pick === outcome}
                  disabled={locked || (!!blocked && pick !== outcome)}
                  reduceMotion={reduceMotion}
                  onPick={onPick}
                  onBanker={onBanker}
                />
              );
            })}
          </View>
        </View>
      )}

      {isBanker ? (
        <View style={styles.bankerBadge} pointerEvents="none">
          <Flame size={14} strokeWidth={2} color={THEME.colors.gold} />
        </View>
      ) : null}

      {bankerHinted && !isBanker ? (
        <View style={styles.hintBadge} pointerEvents="none">
          <Flame size={14} strokeWidth={THEME.icon.stroke} color={THEME.colors.textMuted} />
        </View>
      ) : null}

      {insightArmed && !insightRevealed && !locked ? (
        <Pressable
          onPress={handleReveal}
          accessibilityRole="button"
          accessibilityLabel={'REVEAL ' + fixture.homeShort}
          style={styles.revealOverlay}>
          <View style={styles.revealInner}>
            <Eye size={20} strokeWidth={THEME.icon.stroke} color={THEME.colors.secondary} />
            <Text style={styles.revealText}>TAP TO REVEAL</Text>
          </View>
        </Pressable>
      ) : null}

      {active ? (
        <Animated.View style={[styles.activeGlow, { opacity: pulse }]} pointerEvents="none" />
      ) : null}
    </Animated.View>
  );
}

export const FixtureCard = React.memo(FixtureCardBase);

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    alignSelf: 'center',
    backgroundColor: THEME.colors.surfaceAlt,
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  body: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teamRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  teamName: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.text,
    flexShrink: 1,
  },
  vs: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: THEME.colors.textMuted,
    paddingHorizontal: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  formCol: {
    width: 44,
    gap: 3,
  },
  formTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  formFill: {
    height: 4,
    borderRadius: 2,
  },
  statText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: THEME.colors.textSecondary,
    ...NUM,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  insightText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: THEME.colors.secondary,
    ...NUM,
  },
  pickRow: {
    flexDirection: 'row',
    gap: PICK_GAP,
  },
  settledRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settledTeams: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  settledScore: {
    fontSize: 15,
    fontWeight: '900',
    color: THEME.colors.text,
    ...NUM,
  },
  settledPick: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: THEME.colors.textMuted,
  },
  settledIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankerBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(224,177,92,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17,17,20,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  revealText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: THEME.colors.secondary,
  },
  activeGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    backgroundColor: THEME.colors.secondary,
  },
});
