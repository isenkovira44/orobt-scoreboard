import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

type Props = {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  tone?: 'neutral' | 'gold' | 'danger' | 'violet';
  height?: number;
  style?: ViewStyle;
};

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

const BORDERS = {
  neutral: THEME.colors.hairlineStrong,
  gold: THEME.colors.gold,
  danger: THEME.colors.miss,
  violet: THEME.colors.secondary,
};

const LABELS = {
  neutral: THEME.colors.text,
  gold: THEME.colors.gold,
  danger: THEME.colors.miss,
  violet: THEME.colors.secondary,
};

export function SecondaryButton({
  label,
  onPress,
  icon,
  disabled,
  tone = 'neutral',
  height = 48,
  style,
}: Props) {
  const press = usePressScale(0.97);
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={disabled ? undefined : press.onPressIn}
      onPressOut={disabled ? undefined : press.onPressOut}
      disabled={disabled}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={[styles.pressable, { height }, style]}>
      <Animated.View
        style={[
          styles.surface,
          { height, borderColor: BORDERS[tone] },
          disabled ? styles.disabled : null,
          press.style,
        ]}>
        <View style={styles.row}>
          {icon ? <View style={styles.iconBox}>{icon}</View> : null}
          <Text style={[styles.label, { color: LABELS[tone] }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  surface: {
    width: '100%',
    borderRadius: 14,
    backgroundColor: THEME.colors.fill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  iconBox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
});
