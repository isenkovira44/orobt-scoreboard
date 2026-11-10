import { Check, Lock, Target } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../constants/theme';
import { ChallengeDef, ChallengeId, ChallengeState } from '../game/challenges';
import { SecondaryButton } from './SecondaryButton';

type Props = {
  challenge: ChallengeDef;
  state: ChallengeState;
  progress: number;
  onStart: (id: ChallengeId) => void;
};

export function ChallengeCard({ challenge, state, progress, onStart }: Props) {
  const handleStart = useCallback(() => onStart(challenge.id), [challenge.id, onStart]);

  const tone =
    state === 'complete'
      ? THEME.colors.primary
      : state === 'locked'
      ? THEME.colors.textMuted
      : THEME.colors.secondary;

  const statusText =
    state === 'complete'
      ? 'COMPLETE ✓'
      : state === 'locked'
      ? 'REACH ANALYST LV.' + challenge.unlockLevel
      : 'ACTIVE';

  return (
    <View style={[styles.card, { borderColor: state === 'active' ? tone + '55' : THEME.colors.hairline }]}>
      <View style={styles.head}>
        <View style={[styles.iconWrap, { backgroundColor: tone + '1A' }]}>
          {state === 'complete' ? (
            <Check size={20} strokeWidth={2} color={tone} />
          ) : state === 'locked' ? (
            <Lock size={20} strokeWidth={THEME.icon.stroke} color={tone} />
          ) : (
            <Target size={20} strokeWidth={THEME.icon.stroke} color={tone} />
          )}
        </View>
        <View style={styles.headText}>
          <Text style={styles.title} numberOfLines={1}>
            {challenge.title}
          </Text>
          <Text style={[styles.status, { color: tone }]} numberOfLines={1}>
            {statusText}
          </Text>
        </View>
      </View>

      <Text style={styles.objective} numberOfLines={2}>
        {challenge.objective}
      </Text>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { flex: Math.max(0.02, Math.min(1, progress)), backgroundColor: tone },
          ]}
        />
        <View style={{ flex: Math.max(0, 1 - Math.min(1, progress)) }} />
      </View>

      <View style={styles.footer}>
        <View style={[styles.rewardChip, { borderColor: tone + '55' }]}>
          <Text style={[styles.rewardText, { color: tone }]} numberOfLines={1}>
            {challenge.reward}
          </Text>
        </View>
        <View style={styles.startSlot}>
          <SecondaryButton
            label={state === 'complete' ? 'REPLAY' : 'START'}
            onPress={handleStart}
            disabled={state === 'locked'}
            tone={state === 'complete' ? 'neutral' : 'violet'}
            height={44}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: 14,
    marginBottom: 10,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headText: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    color: THEME.colors.text,
  },
  status: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  objective: {
    marginTop: 10,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: THEME.colors.textSecondary,
  },
  track: {
    marginTop: 10,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  fill: {
    height: 4,
    borderRadius: 2,
  },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rewardChip: {
    flex: 1,
    minHeight: 32,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
  },
  rewardText: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  startSlot: {
    width: 110,
  },
});
