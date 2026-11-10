import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

type Props = {
  title: string;
  icon: React.ReactNode;
  accent: string;
  secondary?: string | null;
  onPress: () => void;
  disabled?: boolean;
  height: number;
  style?: ViewStyle;
};

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

/** The shared bento surface. `secondary` renders null when there is nothing to say. */
export function BentoTile({
  title,
  icon,
  accent,
  secondary,
  onPress,
  disabled,
  height,
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
      accessibilityLabel={title}
      style={[styles.pressable, { height }, style]}>
      <Animated.View
        style={[styles.tile, { height }, disabled ? styles.disabled : null, press.style]}>
        <View style={styles.topLine} />
        <View style={[styles.iconWrap, { backgroundColor: accent + '1A' }]}>{icon}</View>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {secondary ? (
          <Text style={[styles.secondary, { color: accent }]} numberOfLines={1}>
            {secondary}
          </Text>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  tile: {
    width: '100%',
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.hairline,
    borderRadius: 18,
    padding: 14,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.45,
  },
  topLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: THEME.colors.text,
  },
  secondary: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
});
