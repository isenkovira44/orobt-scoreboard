import { CalendarCheck, Check, Play } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { CrestImage } from '../components/CrestImage';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenShell } from '../components/ScreenShell';
import { TopBar } from '../components/TopBar';
import { DAILY_STAKE } from '../constants/config';
import { THEME, NUM } from '../constants/theme';
import { DAILY_LADDER, dailySlate, dayIndex } from '../game/dailyMode';
import { SaveBlob } from '../game/persistence';
import { formatDayIndex, formatOdds } from '../utils/format';

type Props = {
  save: SaveBlob;
  onBack: () => void;
  onStart: () => void;
};

const RING = 72;
const RADIUS = 30;
const CIRC = 2 * Math.PI * RADIUS;

export function DailyModeScreen({ save, onBack, onStart }: Props) {
  const today = dayIndex();
  const slate = useMemo(() => dailySlate(save.clubs, today), [save.clubs, today]);
  const done = save.lastDailyIndex === today;
  const streak = save.dailyStreak;
  const ratio = Math.min(1, streak / 7);

  return (
    <ScreenShell variant="screen">
      <TopBar title="DAILY MODE" subtitle={formatDayIndex(today)} onBack={onBack} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.panel}>
          <View style={styles.panelHead}>
            <View style={styles.iconWrap}>
              <CalendarCheck
                size={20}
                strokeWidth={THEME.icon.stroke}
                color={THEME.colors.primary}
              />
            </View>
            <View style={styles.panelHeadText}>
              <Text style={styles.panelTitle}>DAILY SLATE</Text>
              <Text style={styles.panelSub}>
                FIXED {DAILY_STAKE} SP STAKE · ONE ATTEMPT PER DAY
              </Text>
            </View>
          </View>

          {slate.fixtures.map(fixture => (
            <View key={fixture.id} style={styles.row}>
              <CrestImage crestIndex={fixture.homeCrest} size={20} />
              <Text style={styles.rowTeams} numberOfLines={1}>
                {fixture.homeShort} vs {fixture.awayShort}
              </Text>
              <Text style={styles.rowOdds}>
                {formatOdds(fixture.odds[0], save.settings.multiplierFormat)}
              </Text>
              <CrestImage crestIndex={fixture.awayCrest} size={20} />
            </View>
          ))}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>DAILY STREAK</Text>
          <View style={styles.streakRow}>
            <View style={styles.ringWrap}>
              <Svg width={RING} height={RING}>
                <Circle
                  cx={RING / 2}
                  cy={RING / 2}
                  r={RADIUS}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={6}
                  fill="none"
                />
                <Circle
                  cx={RING / 2}
                  cy={RING / 2}
                  r={RADIUS}
                  stroke={THEME.colors.primary}
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeDasharray={CIRC + ',' + CIRC}
                  strokeDashoffset={CIRC * (1 - ratio)}
                  fill="none"
                  transform={'rotate(-90 ' + RING / 2 + ' ' + RING / 2 + ')'}
                />
              </Svg>
              <View style={styles.ringCenter} pointerEvents="none">
                <Text style={styles.ringValue}>{streak}</Text>
              </View>
            </View>
            <View style={styles.ladder}>
              {DAILY_LADDER.map(step => (
                <View key={step.days} style={styles.ladderRow}>
                  <View
                    style={[
                      styles.ladderDot,
                      {
                        backgroundColor:
                          streak >= step.days ? THEME.colors.primary : 'rgba(255,255,255,0.12)',
                      },
                    ]}
                  />
                  <Text style={styles.ladderText}>{step.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {done ? (
          <View style={styles.donePanel}>
            <View style={styles.doneIcon}>
              <Check size={24} strokeWidth={2} color={THEME.colors.primary} />
            </View>
            <Text style={styles.doneTitle}>TODAY IS DONE ✓</Text>
            <Text style={styles.doneHint}>
              COME BACK TOMORROW FOR A NEW SLATE · YOUR STREAK IS SAFE
            </Text>
          </View>
        ) : (
          <PrimaryButton
            label="START DAILY"
            onPress={onStart}
            height={56}
            icon={<Play size={20} strokeWidth={2} color={THEME.colors.onPrimary} />}
          />
        )}
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
  panel: {
    width: '100%',
    padding: 14,
    marginBottom: 12,
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
  panelHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(0,226,122,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelHeadText: {
    flex: 1,
  },
  panelTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: THEME.colors.text,
  },
  panelSub: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: THEME.colors.textMuted,
  },
  row: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
  },
  rowTeams: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: THEME.colors.text,
  },
  rowOdds: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.primary,
    ...NUM,
  },
  streakRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ringWrap: {
    width: RING,
    height: RING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: {
    fontSize: 20,
    fontWeight: '900',
    color: THEME.colors.text,
    ...NUM,
  },
  ladder: {
    flex: 1,
    gap: 10,
  },
  ladderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ladderDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  ladderText: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: THEME.colors.textSecondary,
  },
  donePanel: {
    width: '100%',
    padding: 18,
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(0,226,122,0.35)',
    borderRadius: 18,
  },
  doneIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(0,226,122,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  doneTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: THEME.colors.primary,
  },
  doneHint: {
    marginTop: 8,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: THEME.colors.textMuted,
    textAlign: 'center',
  },
});
