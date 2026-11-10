import { Coins } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { THEME, NUM } from '../constants/theme';
import { formatSP } from '../utils/format';

type Props = {
  value: number;
  reduceMotion?: boolean;
};

/** One balance pill shared by Menu, Game and Result. Pulses when the value changes. */
export function BalancePill({ value, reduceMotion }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduceMotion) {
      return;
    }
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.12, duration: 160, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 160, useNativeDriver: true }),
    ]).start();
  }, [value, scale, reduceMotion]);

  return (
    <Animated.View style={[styles.pill, { transform: [{ scale }] }]}>
      <Coins size={16} strokeWidth={THEME.icon.stroke} color={THEME.colors.primary} />
      <Text style={styles.value}>{formatSP(value)} SP</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: THEME.colors.fill,
    borderWidth: 1,
    borderColor: 'rgba(0,226,122,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  value: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.primary,
    ...NUM,
  },
});
