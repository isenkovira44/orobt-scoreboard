import { Home, Play } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../constants/theme';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';

type Props = {
  onResume: () => void;
  onMenu: () => void;
};

/** Each popup button carries its own caption and a real action. */
export function PausePopup({ onResume, onMenu }: Props) {
  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <Text style={styles.title}>MATCHDAY PAUSED</Text>
        <Text style={styles.hint}>THE REVEAL IS HELD · NOTHING IS LOST</Text>
        <View style={styles.actions}>
          <PrimaryButton
            label="RESUME"
            onPress={onResume}
            height={56}
            icon={<Play size={20} strokeWidth={2} color={THEME.colors.onPrimary} />}
          />
          <View style={styles.spacer} />
          <SecondaryButton
            label="MENU"
            onPress={onMenu}
            height={48}
            icon={<Home size={20} strokeWidth={THEME.icon.stroke} color={THEME.colors.text} />}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,5,10,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    padding: 20,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.hairlineStrong,
    borderRadius: 22,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: THEME.colors.text,
  },
  hint: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: THEME.colors.textMuted,
    textAlign: 'center',
  },
  actions: {
    marginTop: 20,
    width: '100%',
  },
  spacer: {
    height: 10,
  },
});
