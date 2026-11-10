import { AlertTriangle, Award } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../constants/theme';

type Props = {
  tone: 'warning' | 'unlock';
  text: string;
  onPress?: () => void;
};

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

export function InfoBanner({ tone, text, onPress }: Props) {
  const color = tone === 'warning' ? THEME.colors.gold : THEME.colors.primary;
  const body = (
    <View style={[styles.banner, { borderColor: color, backgroundColor: color + '14' }]}>
      <View style={styles.iconBox}>
        {tone === 'warning' ? (
          <AlertTriangle size={18} strokeWidth={THEME.icon.stroke} color={color} />
        ) : (
          <Award size={18} strokeWidth={THEME.icon.stroke} color={color} />
        )}
      </View>
      <Text style={[styles.text, { color }]} numberOfLines={2}>
        {text}
      </Text>
    </View>
  );

  if (!onPress) {
    return body;
  }
  return (
    <Pressable
      onPress={onPress}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={text}
      style={styles.pressable}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
    height: 52,
  },
  banner: {
    width: '100%',
    minHeight: 44,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
