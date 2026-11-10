import { LineChart } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { HitBars } from '../components/HitBars';
import { ProgressChart } from '../components/ProgressChart';
import { ScreenShell } from '../components/ScreenShell';
import { StatCardRow } from '../components/StatCard';
import { TopBar } from '../components/TopBar';
import { GRID_W } from '../constants/config';
import { THEME, NUM } from '../constants/theme';
import { SaveBlob } from '../game/persistence';
import { levelProgress } from '../game/progression';
import { summarise } from '../game/progressStats';
import { formatPercent } from '../utils/format';

type Props = {
  save: SaveBlob;
  onBack: () => void;
  onPlay: () => void;
};

export function ProgressScreen({ save, onBack, onPlay }: Props) {
  const stats = useMemo(() => summarise(save.history), [save.history]);
  const level = useMemo(() => levelProgress(save.xp), [save.xp]);

  if (stats.slips === 0) {
    return (
      <ScreenShell variant="screen">
        <TopBar title="PROGRESS" subtitle="ACCURACY TRENDS" onBack={onBack} />
        <EmptyState
          icon={<LineChart size={32} strokeWidth={THEME.icon.stroke} color={THEME.colors.textMuted} />}
          title="NO MATCHDAYS YET"
          hint="PLAY A MATCHDAY TO SEE YOUR TRENDS"
          actionLabel="START MATCHDAY"
          onAction={onPlay}
        />
      </ScreenShell>
    );
  }

  const chartW = GRID_W - 28;

  return (
    <ScreenShell variant="screen">
      <TopBar title="PROGRESS" subtitle={'LAST ' + stats.slips + ' MATCHDAYS'} onBack={onBack} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>ACCURACY TREND</Text>
          <ProgressChart
            samples={stats.samples}
            width={chartW}
            reduceMotion={save.settings.reduceMotion}
          />
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>HITS PER MATCHDAY</Text>
          <HitBars samples={stats.hitSamples} bestIndex={stats.bestIndex} width={chartW} />
        </View>

        <StatCardRow
          items={[
            {
              key: 'accuracy',
              value: formatPercent(stats.accuracy),
              label: 'ACCURACY',
              valueColor: THEME.colors.primary,
            },
            {
              key: 'streak',
              value: String(stats.bestStreak),
              label: 'BEST STREAK',
              valueColor: THEME.colors.gold,
            },
            {
              key: 'slips',
              value: String(stats.slips),
              label: 'SLIPS',
              valueColor: THEME.colors.secondary,
            },
          ]}
        />

        <View style={styles.gap} />

        <StatCardRow
          items={[
            {
              key: 'home',
              value: formatPercent(stats.homeRate),
              label: 'HOME PICKS',
              valueColor: THEME.colors.primary,
            },
            {
              key: 'draw',
              value: formatPercent(stats.drawRate),
              label: 'DRAW PICKS',
              valueColor: THEME.colors.secondary,
            },
            {
              key: 'banker',
              value: formatPercent(stats.bankerRate),
              label: 'BANKER',
              valueColor: THEME.colors.gold,
            },
          ]}
        />

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>ANALYST LEVEL</Text>
          <View style={styles.levelRow}>
            <Text style={styles.levelValue}>LV.{level.level}</Text>
            <View style={styles.xpTrack}>
              <View
                style={[
                  styles.xpFill,
                  { flex: Math.max(0.03, Math.min(1, level.into / level.span)) },
                ]}
              />
              <View style={{ flex: Math.max(0, 1 - level.into / level.span) }} />
            </View>
          </View>
          <Text style={styles.levelHint}>
            {level.into} / {level.span} XP TO ANALYST LV.{level.level + 1}
          </Text>
        </View>
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
  panelTitle: {
    marginBottom: 10,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: THEME.colors.text,
  },
  gap: {
    height: 10,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  levelValue: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    color: THEME.colors.secondary,
    ...NUM,
  },
  xpTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  xpFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.secondary,
  },
  levelHint: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: THEME.colors.textMuted,
    ...NUM,
  },
});
