import React from 'react';
import { Animated, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

type Props = {
  label: string;
  active: boolean;
  onPress: () => void;
  disabled?: boolean;
  width?: number | string;
  style?: ViewStyle;
};

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

export function Chip({ label, active, onPress, disabled, style }: Props) {
  const press = usePressScale(0.95);
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={disabled ? undefined : press.onPressIn}
      onPressOut={disabled ? undefined : press.onPressOut}
      disabled={disabled}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active, disabled: !!disabled }}
      style={[styles.pressable, style]}>
      <Animated.View
        style={[
          styles.chip,
          active ? styles.chipActive : null,
          disabled ? styles.chipDisabled : null,
          press.style,
        ]}>
        <Text style={[styles.label, active ? styles.labelActive : null]} numberOfLines={1}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    height: 40,
  },
  chip: {
    width: '100%',
    height: 40,
    borderRadius: 12,
    backgroundColor: THEME.colors.fill,
    borderWidth: 1,
    borderColor: THEME.colors.hairlineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: 'rgba(0,226,122,0.12)',
    borderColor: THEME.colors.primary,
  },
  chipDisabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '800',
    letterSpacing: 1,
    color: THEME.colors.textSecondary,
  },
  labelActive: {
    color: THEME.colors.primary,
  },
});
