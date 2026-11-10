import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../constants/theme';
import { PrimaryButton } from './PrimaryButton';

type Props = {
  icon: React.ReactNode;
  title: string;
  hint: string;
  actionLabel?: string;
  onAction?: () => void;
};

/** The themed centred card used wherever a screen can legitimately have no data. */
export function EmptyState({ icon, title, hint, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>{icon}</View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.hint}>{hint}</Text>
        {actionLabel && onAction ? (
          <View style={styles.action}>
            <PrimaryButton label={actionLabel} onPress={onAction} height={52} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    paddingVertical: 28,
    paddingHorizontal: 20,
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
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: THEME.colors.text,
    textAlign: 'center',
  },
  hint: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.1,
    lineHeight: 17,
    color: THEME.colors.textMuted,
    textAlign: 'center',
  },
  action: {
    marginTop: 18,
    width: '100%',
  },
});
