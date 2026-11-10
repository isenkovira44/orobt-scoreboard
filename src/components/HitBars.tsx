import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { THEME } from '../constants/theme';

type Props = {
  samples: number[];
  bestIndex: number;
  width: number;
};

const HEIGHT = 72;
const BAR_W = 18;
const MAX_HITS = 5;

/** Hits per matchday, 0-5. The best day is gold. */
export function HitBars({ samples, bestIndex, width }: Props) {
  if (samples.length === 0) {
    return null;
  }
  const gap = samples.length > 1 ? Math.max(4, (width - samples.length * BAR_W) / (samples.length - 1)) : 0;

  return (
    <View style={styles.wrap}>
      <Svg width={width} height={HEIGHT}>
        {samples.map((value, index) => {
          const h = Math.max(4, (Math.min(MAX_HITS, value) / MAX_HITS) * (HEIGHT - 8));
          const x = index * (BAR_W + gap);
          return (
            <Rect
              key={index}
              x={x}
              y={HEIGHT - h}
              width={BAR_W}
              height={h}
              rx={4}
              fill={index === bestIndex ? THEME.colors.gold : THEME.colors.secondary}
            />
          );
        })}
      </Svg>
      <Text style={styles.caption}>HITS PER MATCHDAY · BEST DAY IN GOLD</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'flex-start',
  },
  caption: {
    marginTop: 6,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: THEME.colors.textMuted,
  },
});
