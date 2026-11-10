import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { THEME } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

type Props = {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  height?: number;
  tone?: 'primary' | 'gold';
  style?: ViewStyle;
};

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };
const GRADIENTS = {
  primary: ['#00E27A', '#00B964'],
  gold: ['#E0B15C', '#C08F3C'],
};

/**
 * Icon box is a fixed 24x24, label lineHeight is 24, gap is 10, row centred.
 * The icon is never absolutely positioned.
 */
export function PrimaryButton({
  label,
  onPress,
  icon,
  disabled,
  height = 60,
  tone = 'primary',
  style,
}: Props) {
  const press = usePressScale(0.97);
  const colors = disabled
    ? [THEME.colors.elevated, THEME.colors.elevated]
    : GRADIENTS[tone];

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
      <Animated.View style={[styles.animated, { height }, press.style]}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.surface,
            { height },
            disabled ? styles.disabled : styles.enabled,
          ]}>
          <View style={styles.row}>
            {icon ? <View style={styles.iconBox}>{icon}</View> : null}
            <Text style={[styles.label, disabled ? styles.labelDisabled : null]} numberOfLines={1}>
              {label}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  animated: {
    width: '100%',
  },
  surface: {
    width: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enabled: {
    shadowColor: THEME.colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  disabled: {
    opacity: 0.45,
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
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: THEME.colors.onPrimary,
  },
  labelDisabled: {
    color: THEME.colors.textSecondary,
  },
});
