import { Compass, Crown, Flame, Gem, Lock, Shield, Star, Zap } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { TILE_W } from '../constants/config';
import { THEME } from '../constants/theme';
import { Badge } from '../game/collection';
import { usePressScale } from '../hooks/usePressScale';
import { CrestImage } from './CrestImage';

type Props = {
  badge: Badge;
  unlocked: boolean;
  onPress: (id: string) => void;
};

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

function BadgeArtView({ badge, size }: { badge: Badge; size: number }) {
  if (badge.art.kind === 'crest') {
    return <CrestImage crestIndex={badge.art.crestIndex} size={size} />;
  }
  const color = badge.tint;
  switch (badge.art.icon) {
    case 'flame':
      return <Flame size={28} strokeWidth={THEME.icon.stroke} color={color} />;
    case 'shield':
      return <Shield size={28} strokeWidth={THEME.icon.stroke} color={color} />;
    case 'crown':
      return <Crown size={28} strokeWidth={THEME.icon.stroke} color={color} />;
    case 'zap':
      return <Zap size={28} strokeWidth={THEME.icon.stroke} color={color} />;
    case 'star':
      return <Star size={28} strokeWidth={THEME.icon.stroke} color={color} />;
    case 'compass':
      return <Compass size={28} strokeWidth={THEME.icon.stroke} color={color} />;
    case 'gem':
    default:
      return <Gem size={28} strokeWidth={THEME.icon.stroke} color={color} />;
  }
}

function BadgeTileBase({ badge, unlocked, onPress }: Props) {
  const press = usePressScale(0.95);
  const handlePress = useCallback(() => onPress(badge.id), [badge.id, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={badge.name}
      style={styles.pressable}>
      <Animated.View style={[styles.tile, unlocked ? null : styles.locked, press.style]}>
        <View style={[styles.art, { backgroundColor: badge.tint + '1A' }]}>
          <BadgeArtView badge={badge} size={40} />
        </View>
        <Text style={styles.name} numberOfLines={2}>
          {badge.name}
        </Text>
        {unlocked ? null : (
          <View style={styles.lockRow}>
            <Lock size={12} strokeWidth={THEME.icon.stroke} color={THEME.colors.textMuted} />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

export const BadgeTile = React.memo(BadgeTileBase);

const styles = StyleSheet.create({
  pressable: {
    width: TILE_W,
    height: TILE_W + 26,
  },
  tile: {
    width: TILE_W,
    height: TILE_W + 26,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.hairline,
    borderRadius: 16,
  },
  locked: {
    opacity: 0.35,
  },
  art: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    marginTop: 6,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: THEME.colors.text,
    textAlign: 'center',
  },
  lockRow: {
    marginTop: 4,
    width: 20,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
