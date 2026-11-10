import { Activity } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { THEME, NUM } from '../constants/theme';

export type StatCardData = {
  key: string;
  value: string;
  label: string;
  valueColor: string;
};

type Props = StatCardData;

/**
 * One icon shape for every pill in a row; the colour, the value and the label are
 * what differentiate them, so the pills stay visually identical in size.
 * A pill with no value renders null.
 */
export function StatCard({ value, label, valueColor }: Props) {
  if (!value) {
    return null;
  }
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: valueColor + '22' }]}>
        <Activity size={22} strokeWidth={THEME.icon.stroke} color={valueColor} />
      </View>
      <Text style={[styles.value, { color: valueColor }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

type RowProps = { items: StatCardData[] };

/** A row with fewer than two visible cards is not rendered at all. */
export function StatCardRow({ items }: RowProps) {
  const visible = items.filter(i => !!i.value);
  if (visible.length < 2) {
    return null;
  }
  return (
    <View style={styles.row}>
      {visible.map(item => (
        <View key={item.key} style={styles.slot}>
          <StatCard {...item} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  slot: {
    flex: 1,
  },
  card: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
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
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
    ...NUM,
  },
  label: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: THEME.colors.textMuted,
  },
});
