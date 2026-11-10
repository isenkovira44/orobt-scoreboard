import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ASSETS } from '../assets';
import { THEME } from '../constants/theme';

export type ShellVariant = 'loader' | 'menu' | 'screen' | 'game' | 'win' | 'lose' | 'neutral';

const STOPS: Record<ShellVariant, string[]> = {
  loader: THEME.gradients.loader as unknown as string[],
  menu: THEME.gradients.menu as unknown as string[],
  screen: THEME.gradients.screen as unknown as string[],
  game: THEME.gradients.game as unknown as string[],
  win: THEME.gradients.resultWin as unknown as string[],
  lose: THEME.gradients.resultLose as unknown as string[],
  neutral: THEME.gradients.resultNeutral as unknown as string[],
};

type Props = {
  variant: ShellVariant;
  children: React.ReactNode;
};

/**
 * Four layers on every screen: background image -> gradient overlay -> decor blobs -> content.
 * bg_game is the only background asset; the overlay is what tells the screens apart.
 */
export function ScreenShell({ variant, children }: Props) {
  const stops = STOPS[variant];
  const locations = stops.length === 3 ? [0, 0.55, 1] : [0, 1];
  return (
    <ImageBackground source={ASSETS.bgGame} style={styles.bg} resizeMode="cover">
      <LinearGradient
        colors={stops}
        locations={locations}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {variant === 'loader' ? (
        <View style={styles.loaderVeil} pointerEvents="none" />
      ) : null}
      <LinearGradient
        colors={['rgba(0,226,122,0.12)', 'rgba(0,226,122,0)']}
        style={styles.blobTop}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(162,155,254,0.10)', 'rgba(162,155,254,0)']}
        style={styles.blobBottom}
        pointerEvents="none"
      />
      <View style={styles.content}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
  },
  loaderVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,5,10,0.55)',
  },
  blobTop: {
    position: 'absolute',
    top: -80,
    right: -90,
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  blobBottom: {
    position: 'absolute',
    bottom: -110,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  content: {
    flex: 1,
  },
});
