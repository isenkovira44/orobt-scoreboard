import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

export type SettingOption<T> = { value: T; label: string };

type Props<T> = {
  label: string;
  hint: string;
  options: Array<SettingOption<T>>;
  value: T;
  onChange: (value: T) => void;
  tone?: 'neutral' | 'danger';
};

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

function Segment<T>({
  option,
  active,
  onChange,
}: {
  option: SettingOption<T>;
  active: boolean;
  onChange: (value: T) => void;
}) {
  const press = usePressScale(0.95);
  return (
    <Pressable
      onPress={() => onChange(option.value)}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={option.label}
      accessibilityState={{ selected: active }}
      style={styles.segmentPressable}>
      <Animated.View style={[styles.segment, active ? styles.segmentActive : null, press.style]}>
        <Text style={[styles.segmentLabel, active ? styles.segmentLabelActive : null]}>
          {option.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function SettingRow<T extends string | boolean>({
  label,
  hint,
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.hint} numberOfLines={2}>
          {hint}
        </Text>
      </View>
      <View style={styles.segments}>
        {options.map(option => (
          <Segment
            key={String(option.value)}
            option={option}
            active={option.value === value}
            onChange={onChange}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    padding: 14,
    marginBottom: 10,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.hairline,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  texts: {
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: THEME.colors.text,
  },
  hint: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: THEME.colors.textMuted,
  },
  segments: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentPressable: {
    flex: 1,
    height: 40,
  },
  segment: {
    width: '100%',
    height: 40,
    borderRadius: 12,
    backgroundColor: THEME.colors.fill,
    borderWidth: 1,
    borderColor: THEME.colors.hairlineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: 'rgba(0,226,122,0.12)',
    borderColor: THEME.colors.primary,
  },
  segmentLabel: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
    letterSpacing: 1,
    color: THEME.colors.textSecondary,
  },
  segmentLabelActive: {
    color: THEME.colors.primary,
  },
});
