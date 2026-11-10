import { Medal } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BadgeTile } from '../components/BadgeTile';

import { ScreenShell } from '../components/ScreenShell';
import { SecondaryButton } from '../components/SecondaryButton';
import { TopBar } from '../components/TopBar';
import { GRID_GAP } from '../constants/config';
import { THEME, NUM } from '../constants/theme';
import { BADGES, badgeById } from '../game/collection';
import { SaveBlob } from '../game/persistence';

type Props = {
  save: SaveBlob;
  onBack: () => void;
  onPlay: () => void;
};

export function CollectionScreen({ save, onBack, onPlay }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const owned = save.badges;

  const handleSelect = useCallback((id: string) => {
    setSelected(prev => (prev === id ? null : id));
  }, []);

  const closeDetail = useCallback(() => setSelected(null), []);

  const detail = useMemo(() => (selected ? badgeById(selected) : undefined), [selected]);

  return (
    <ScreenShell variant="screen">
      <TopBar
        title="COLLECTION"
        subtitle="ANALYST BADGES"
        onBack={onBack}
        right={
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {owned.length} / {BADGES.length}
            </Text>
          </View>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {owned.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Medal size={28} strokeWidth={THEME.icon.stroke} color={THEME.colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>NOTHING UNLOCKED YET</Text>
            <Text style={styles.emptyHint}>
              PLAY TO UNLOCK · EVERY BADGE BELOW STATES ITS OWN CONDITION
            </Text>
            <View style={styles.emptyAction}>
              <SecondaryButton label="START MATCHDAY" onPress={onPlay} height={44} />
            </View>
          </View>
        ) : null}

        <View style={styles.grid}>
          {BADGES.map(badge => (
            <BadgeTile
              key={badge.id}
              badge={badge}
              unlocked={owned.indexOf(badge.id) >= 0}
              onPress={handleSelect}
            />
          ))}
        </View>

        {detail ? (
          <View style={styles.detail}>
            <Text style={styles.detailName}>{detail.name}</Text>
            <Text style={styles.detailCondition}>{detail.condition}</Text>
            <Text style={styles.detailState}>
              {owned.indexOf(detail.id) >= 0 ? 'UNLOCKED ✓' : 'STILL LOCKED'}
            </Text>
            <View style={styles.detailAction}>
              <SecondaryButton label="CLOSE" onPress={closeDetail} height={44} />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  counter: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: THEME.colors.fill,
    borderWidth: 1,
    borderColor: THEME.colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: THEME.colors.primary,
    ...NUM,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  emptyCard: {
    marginBottom: 14,
    padding: 16,
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.hairline,
    borderRadius: 18,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: THEME.colors.text,
  },
  emptyHint: {
    marginTop: 6,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '600',
    letterSpacing: 1,
    color: THEME.colors.textMuted,
    textAlign: 'center',
  },
  emptyAction: {
    marginTop: 12,
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    justifyContent: 'flex-start',
  },
  detail: {
    marginTop: 14,
    padding: 16,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.hairlineStrong,
    borderRadius: 18,
  },
  detailName: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: THEME.colors.text,
  },
  detailCondition: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: THEME.colors.textSecondary,
  },
  detailState: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: THEME.colors.primary,
  },
  detailAction: {
    marginTop: 14,
  },
});
