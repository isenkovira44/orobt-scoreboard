import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ASSETS } from '../assets';
import { HEADER_TOP_PAD } from '../constants/config';
import { THEME } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
};

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

/**
 * The one header used by every screen. Screens differ only by title / subtitle /
 * right slot, so the bento styling cannot drift between them.
 */
export function TopBar({ title, subtitle, onBack, backLabel = 'MENU', left, right }: Props) {
  const press = usePressScale(0.94);
  return (
    <View style={styles.wrap}>
      <View style={styles.leftSlot}>
        {left ? left : null}
        {!left && onBack ? (
          <Pressable
            onPress={onBack}
            onPressIn={press.onPressIn}
            onPressOut={press.onPressOut}
            hitSlop={HIT}
            accessibilityRole="button"
            accessibilityLabel={backLabel}
            style={styles.backPressable}>
            <Animated.View style={[styles.backInner, press.style]}>
              <Image
                source={ASSETS.buttonRound}
                style={styles.backPlate}
                resizeMode="contain"
              />
              <View style={styles.iconBox}>
                <ChevronLeft size={20} strokeWidth={THEME.icon.stroke} color={THEME.colors.text} />
              </View>
              <Text style={styles.backLabel}>{backLabel}</Text>
            </Animated.View>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.titleSlot}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.rightSlot}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: HEADER_TOP_PAD,
    height: HEADER_TOP_PAD + 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSlot: {
    width: 104,
    height: 48,
    justifyContent: 'center',
  },
  backPressable: {
    width: 100,
    height: 44,
  },
  backInner: {
    width: 100,
    height: 44,
    borderRadius: 14,
    backgroundColor: THEME.colors.fill,
    borderWidth: 1,
    borderColor: THEME.colors.hairline,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  backPlate: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
    opacity: 0.22,
  },
  iconBox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backLabel: {
    fontSize: 12,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: THEME.colors.text,
  },
  titleSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: THEME.colors.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: THEME.colors.textMuted,
  },
  rightSlot: {
    width: 104,
    height: 48,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
