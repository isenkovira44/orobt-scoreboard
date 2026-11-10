import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../components/ScreenShell';
import { SecondaryButton } from '../components/SecondaryButton';
import { SettingRow } from '../components/SettingRow';
import { TopBar } from '../components/TopBar';
import { THEME } from '../constants/theme';
import { SaveBlob, Settings } from '../game/persistence';
import { SETTING_OPTIONS } from '../hooks/useSettings';

type Props = {
  save: SaveBlob;
  onBack: () => void;
  onChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  onReset: () => void;
};

export function SettingsScreen({ save, onBack, onChange, onReset }: Props) {
  const [confirming, setConfirming] = useState(false);
  const settings = save.settings;

  const setFormat = useCallback(
    (value: 'decimal' | 'chance') => onChange('multiplierFormat', value),
    [onChange],
  );
  const setSpeed = useCallback(
    (value: 'normal' | 'fast') => onChange('revealSpeed', value),
    [onChange],
  );
  const setHint = useCallback((value: boolean) => onChange('bankerHint', value), [onChange]);
  const setMotion = useCallback((value: boolean) => onChange('reduceMotion', value), [onChange]);

  const askReset = useCallback(() => setConfirming(true), []);
  const cancelReset = useCallback(() => setConfirming(false), []);
  const confirmReset = useCallback(() => {
    setConfirming(false);
    onReset();
  }, [onReset]);

  return (
    <ScreenShell variant="screen">
      <TopBar title="SETTINGS" subtitle="EVERY OPTION HAS AN EFFECT" onBack={onBack} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <SettingRow
          label="MULTIPLIER FORMAT"
          hint="DECIMAL SHOWS x1.85 ON EVERY PICK · CHANCE SHOWS 54%"
          options={SETTING_OPTIONS.multiplierFormat}
          value={settings.multiplierFormat}
          onChange={setFormat}
        />
        <SettingRow
          label="REVEAL SPEED"
          hint="HOW LONG EACH LEG TAKES TO SETTLE · NORMAL 600 MS · FAST 250 MS"
          options={SETTING_OPTIONS.revealSpeed}
          value={settings.revealSpeed}
          onChange={setSpeed}
        />
        <SettingRow
          label="BANKER HINT"
          hint="MARKS THE STATISTICALLY STRONGEST SELECTED LEG ON THE BOARD"
          options={SETTING_OPTIONS.toggle}
          value={settings.bankerHint}
          onChange={setHint}
        />
        <SettingRow
          label="REDUCE MOTION"
          hint="DROPS DECORATIVE LOOPS AND SHORTENS EVERY TRANSITION TO 120 MS"
          options={SETTING_OPTIONS.toggle}
          value={settings.reduceMotion}
          onChange={setMotion}
        />

        <View style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>RESET PROGRESS</Text>
          <Text style={styles.dangerHint}>
            CLEARS SCORE POINTS, ANALYST XP, STREAK, BADGES AND MATCHDAY HISTORY.
          </Text>
          {confirming ? (
            <View style={styles.dangerRow}>
              <View style={styles.dangerSlot}>
                <SecondaryButton
                  label="CONFIRM RESET"
                  tone="danger"
                  height={44}
                  onPress={confirmReset}
                />
              </View>
              <View style={styles.dangerSlot}>
                <SecondaryButton label="CANCEL" height={44} onPress={cancelReset} />
              </View>
            </View>
          ) : (
            <View style={styles.dangerAction}>
              <SecondaryButton label="RESET PROGRESS" tone="danger" height={44} onPress={askReset} />
            </View>
          )}
        </View>

        <Text style={styles.footer}>
          OROBET SCOREBOARD · OFFLINE · FICTIONAL POINTS ONLY · NO REAL-MONEY BETTING
        </Text>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  dangerCard: {
    width: '100%',
    padding: 14,
    marginTop: 4,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,92,122,0.35)',
    borderRadius: 18,
  },
  dangerTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: THEME.colors.miss,
  },
  dangerHint: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: THEME.colors.textMuted,
  },
  dangerAction: {
    marginTop: 12,
  },
  dangerRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  dangerSlot: {
    flex: 1,
  },
  footer: {
    marginTop: 18,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 1,
    color: THEME.colors.textMuted,
    textAlign: 'center',
  },
});
