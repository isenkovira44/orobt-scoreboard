import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MAX_LEGS } from '../constants/config';
import { THEME, NUM } from '../constants/theme';
import { formatMultiplier, formatSP } from '../utils/format';

type Props = {
  legs: number;
  multiplier: number;
  toWin: number;
  bankerActive: boolean;
};

/** The G3 thin stat strip: three equal cells, value over label. */
export function StatStrip({ legs, multiplier, toWin, bankerActive }: Props) {
  const winColor = bankerActive ? THEME.colors.gold : THEME.colors.primary;
  return (
    <View style={styles.strip}>
      <View style={styles.cell}>
        <Text style={styles.value}>
          {legs}/{MAX_LEGS}
        </Text>
        <Text style={styles.label}>LEGS</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.cell}>
        <Text style={styles.value}>{legs > 0 ? formatMultiplier(multiplier) : 'x0.00'}</Text>
        <Text style={styles.label}>TOTAL</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.cell}>
        <Text style={[styles.value, { color: winColor }]}>{formatSP(toWin)} SP</Text>
        <Text style={styles.label}>TO WIN</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: 1,
    height: 26,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  value: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '800',
    color: THEME.colors.text,
    ...NUM,
  },
  label: {
    marginTop: 1,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: THEME.colors.textMuted,
  },
});
