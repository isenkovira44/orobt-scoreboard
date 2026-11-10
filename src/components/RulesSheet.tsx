import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../constants/theme';
import { SecondaryButton } from './SecondaryButton';

type Props = {
  onClose: () => void;
};

const SECTIONS: Array<{ title: string; body: string }> = [
  {
    title: 'HOW A SLIP WORKS',
    body: 'Pick 1, X or 2 on 3 to 5 fixtures. Your multipliers are multiplied together, the stake is deducted when you lock the slip, and every leg has to land for the full payout.',
  },
  {
    title: 'READING THE STATS',
    body: 'The two bars are last-five form for home and away. ATK and DEF are the live ratings, H2H is the head-to-head record. Ratings drift after every matchday, so the table is never the same twice.',
  },
  {
    title: 'BANKER AND INSIGHT',
    body: 'Hold a selected pick for a moment to make it your banker: that leg pays x1.5 and a correct banker returns an Insight Token. Spend a token on a fixture to reveal fatigue and squad news, which really move the simulation.',
  },
  {
    title: 'CASH OUT',
    body: 'While every settled leg is a hit you may take 70 percent of what has landed and end the matchday early. The offer disappears the moment a leg misses.',
  },
  {
    title: 'FAIR PLAY',
    body: 'Score Points are fictional. There is no purchase, no payout and no real-money betting anywhere in this app, and it works fully offline.',
  },
];

export function RulesSheet({ onClose }: Props) {
  return (
    <View style={styles.backdrop}>
      <View style={styles.sheet}>
        <Text style={styles.title}>HOW TO PLAY</Text>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {SECTIONS.map(section => (
            <View key={section.title} style={styles.block}>
              <Text style={styles.blockTitle}>{section.title}</Text>
              <Text style={styles.blockBody}>{section.body}</Text>
            </View>
          ))}
        </ScrollView>
        <SecondaryButton label="CLOSE" onPress={onClose} height={48} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,5,10,0.86)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '82%',
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.hairlineStrong,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.6,
    color: THEME.colors.text,
    marginBottom: 14,
  },
  scroll: {
    marginBottom: 16,
  },
  block: {
    marginBottom: 16,
  },
  blockTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: THEME.colors.primary,
    marginBottom: 6,
  },
  blockBody: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
});
