import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { PICK_W } from '../constants/config';
import { THEME, NUM } from '../constants/theme';
import { Outcome } from '../game/odds';

type Props = {
  fixtureId: string;
  outcome: Outcome;
  letter: string;
  oddsText: string;
  selected: boolean;
  isBanker: boolean;
  disabled: boolean;
  reduceMotion: boolean;
  onPick: (fixtureId: string, outcome: Outcome) => void;
  onBanker: (fixtureId: string) => void;
};

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

function PickButtonBase({
  fixtureId,
  outcome,
  letter,
  oddsText,
  selected,
  isBanker,
  disabled,
  reduceMotion,
  onPick,
  onBanker,
}: Props) {
  const pop = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    onPick(fixtureId, outcome);
  }, [fixtureId, outcome, onPick]);

  const handleLongPress = useCallback(() => {
    onBanker(fixtureId);
  }, [fixtureId, onBanker]);

  useEffect(() => {
    if (!selected || reduceMotion) {
      return;
    }
    Animated.sequence([
      Animated.timing(pop, { toValue: 1.06, duration: 110, useNativeDriver: true }),
      Animated.timing(pop, { toValue: 1, duration: 110, useNativeDriver: true }),
    ]).start();
  }, [selected, pop, reduceMotion]);

  return (
    <Pressable
      onPress={disabled ? undefined : handlePress}
      onLongPress={disabled ? undefined : handleLongPress}
      delayLongPress={400}
      disabled={disabled}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={letter + ' ' + oddsText}
      accessibilityState={{ selected, disabled }}
      style={styles.pressable}>
      <Animated.View
        style={[
          styles.tile,
          selected ? styles.tileSelected : null,
          isBanker ? styles.tileBanker : null,
          disabled ? styles.tileDisabled : null,
          { transform: [{ scale: pop }] },
        ]}>
        <Text style={[styles.letter, selected ? styles.textSelected : null]}>{letter}</Text>
        <Text style={[styles.odds, selected ? styles.textSelected : null]}>{oddsText}</Text>
      </Animated.View>
    </Pressable>
  );
}

export const PickButton = React.memo(PickButtonBase);

const styles = StyleSheet.create({
  pressable: {
    width: PICK_W,
    height: 48,
  },
  tile: {
    width: PICK_W,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileSelected: {
    backgroundColor: 'rgba(0,226,122,0.12)',
    borderColor: THEME.colors.primary,
  },
  tileBanker: {
    borderColor: THEME.colors.gold,
  },
  tileDisabled: {
    opacity: 0.35,
  },
  letter: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  odds: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    ...NUM,
  },
  textSelected: {
    color: THEME.colors.primary,
  },
});
