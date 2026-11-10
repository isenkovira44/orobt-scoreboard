import { Trophy } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { ChallengeCard } from '../components/ChallengeCard';
import { EmptyState } from '../components/EmptyState';
import { ScreenShell } from '../components/ScreenShell';
import { TopBar } from '../components/TopBar';
import { THEME } from '../constants/theme';
import { CHALLENGES, ChallengeId, allCleared, challengeState } from '../game/challenges';
import { SaveBlob } from '../game/persistence';
import { levelForXp } from '../game/progression';

type Props = {
  save: SaveBlob;
  onBack: () => void;
  onStart: (id: ChallengeId) => void;
};

export function ChallengeScreen({ save, onBack, onStart }: Props) {
  const level = useMemo(() => levelForXp(save.xp), [save.xp]);
  const bestAccuracy = useMemo(
    () => save.history.reduce((best, h) => Math.max(best, h.accuracy), 0),
    [save.history],
  );
  const cleared = allCleared(save.challengesDone);

  return (
    <ScreenShell variant="screen">
      <TopBar title="CHALLENGES" subtitle={'ANALYST LV.' + level} onBack={onBack} />

      {cleared ? (
        <EmptyState
          icon={<Trophy size={32} strokeWidth={THEME.icon.stroke} color={THEME.colors.gold} />}
          title="ALL CHALLENGES CLEARED"
          hint="A NEW SET ARRIVES NEXT MATCHDAY · KEEP BUILDING YOUR SLIPS"
          actionLabel="MENU"
          onAction={onBack}
        />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.lead}>
            EACH CHALLENGE CHANGES THE RULES OF THE MATCHDAY AND PAYS A REAL REWARD.
          </Text>
          {CHALLENGES.map(def => {
            const state = challengeState(def, level, save.challengesDone);
            const progress =
              state === 'complete'
                ? 1
                : state === 'locked'
                ? Math.min(1, level / def.unlockLevel)
                : Math.min(1, bestAccuracy / 0.6);
            return (
              <ChallengeCard
                key={def.id}
                challenge={def}
                state={state}
                progress={progress}
                onStart={onStart}
              />
            );
          })}
        </ScrollView>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  lead: {
    marginBottom: 12,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: THEME.colors.textMuted,
  },
});
