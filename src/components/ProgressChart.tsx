import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient as SvgLinearGradient,
  Polygon,
  Polyline,
  Stop,
} from 'react-native-svg';
import { THEME } from '../constants/theme';

type Props = {
  samples: number[];
  width: number;
  reduceMotion: boolean;
};

const HEIGHT = 120;
const PAD_X = 10;
const PAD_Y = 12;

/** Accuracy trend over the last matchdays: polyline, area fill and a 50 % reference. */
export function ProgressChart({ samples, width, reduceMotion }: Props) {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: reduceMotion ? 120 : 600,
      useNativeDriver: true,
    }).start();
  }, [fade, reduceMotion, samples.length]);

  const innerW = Math.max(40, width - PAD_X * 2);
  const innerH = HEIGHT - PAD_Y * 2;
  const count = samples.length;

  const points = samples.map((value, index) => {
    const x = PAD_X + (count <= 1 ? innerW / 2 : (index / (count - 1)) * innerW);
    const y = PAD_Y + (1 - Math.max(0, Math.min(1, value))) * innerH;
    return { x, y };
  });

  const lineStr = points.map(p => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ');
  const areaStr =
    points.length > 0
      ? PAD_X + ',' + (PAD_Y + innerH) + ' ' + lineStr + ' ' + (PAD_X + innerW) + ',' + (PAD_Y + innerH)
      : '';
  const refY = PAD_Y + 0.5 * innerH;

  return (
    <View style={styles.wrap}>
      <Animated.View style={{ opacity: fade }} pointerEvents="none">
        <Svg width={width} height={HEIGHT}>
          <Defs>
            <SvgLinearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={THEME.colors.primary} stopOpacity="0.18" />
              <Stop offset="1" stopColor={THEME.colors.primary} stopOpacity="0" />
            </SvgLinearGradient>
          </Defs>
          <Line
            x1={PAD_X}
            y1={refY}
            x2={PAD_X + innerW}
            y2={refY}
            stroke={THEME.colors.textMuted}
            strokeWidth={1}
            strokeDasharray="4,4"
          />
          {areaStr ? <Polygon points={areaStr} fill="url(#areaFill)" /> : null}
          {lineStr ? (
            <Polyline
              points={lineStr}
              fill="none"
              stroke={THEME.colors.primary}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ) : null}
          {points.map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y} r={4} fill={THEME.colors.primary} />
          ))}
        </Svg>
      </Animated.View>
      <View style={styles.legend}>
        <Text style={styles.legendText}>ACCURACY PER MATCHDAY</Text>
        <Text style={styles.legendText}>50% LINE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  legend: {
    marginTop: 6,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: THEME.colors.textMuted,
  },
});
