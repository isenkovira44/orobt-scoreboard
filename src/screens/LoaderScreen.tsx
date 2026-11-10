import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ASSETS } from '../assets';
import { ANIM, LOADER_DURATION_MS, LOADER_PROGRESS_MS } from '../constants/config';
import { THEME } from '../constants/theme';
import { ScreenShell } from '../components/ScreenShell';

type Props = {
  onDone: () => void;
};

const BAR_W = 180;

/**
 * The brand card. It holds for exactly LOADER_DURATION_MS, driven by a timer:
 * no PLAY button, no stat chips, no tap-to-skip and no touch handler anywhere.
 */
export function LoaderScreen({ onDone }: Props) {
  const tileScale = useRef(new Animated.Value(0.82)).current;
  const tileOpacity = useRef(new Animated.Value(0)).current;
  const logoShift = useRef(new Animated.Value(14)).current;
  const titleIn = useRef(new Animated.Value(0)).current;
  const subtitleIn = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const dots = useRef(new Animated.Value(0.25)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(tileScale, {
        toValue: 1,
        tension: ANIM.enter.tension,
        friction: ANIM.enter.friction,
        useNativeDriver: true,
      }),
      Animated.timing(tileOpacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(logoShift, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();

    const titleAnim = Animated.timing(titleIn, {
      toValue: 1,
      duration: 380,
      delay: 260,
      useNativeDriver: true,
    });
    titleAnim.start();

    const subtitleAnim = Animated.timing(subtitleIn, {
      toValue: 1,
      duration: 380,
      delay: 520,
      useNativeDriver: true,
    });
    subtitleAnim.start();

    // width is a layout property: the native driver is explicitly off
    const bar = Animated.timing(progress, {
      toValue: 1,
      duration: LOADER_PROGRESS_MS,
      useNativeDriver: false,
    });
    bar.start();

    const dotLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(dots, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(dots, { toValue: 0.25, duration: 600, useNativeDriver: true }),
      ]),
    );
    dotLoop.start();

    const exitTimer = setTimeout(() => {
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: ANIM.screen,
        useNativeDriver: true,
      }).start(() => {
        doneRef.current();
      });
    }, LOADER_DURATION_MS - ANIM.screen);

    return () => {
      clearTimeout(exitTimer);
      dotLoop.stop();
      bar.stop();
      titleAnim.stop();
      subtitleAnim.stop();
    };
  }, [tileScale, tileOpacity, logoShift, titleIn, subtitleIn, progress, dots, fadeOut]);

  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: [0, BAR_W] });
  const titleShift = titleIn.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });
  const subtitleShift = subtitleIn.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });

  return (
    <ScreenShell variant="loader">
      <Animated.View style={[styles.root, { opacity: fadeOut }]} pointerEvents="none">
        <View style={styles.glowWrap} pointerEvents="none">
          <LinearGradient
            colors={['rgba(0,226,122,0.16)', 'rgba(0,226,122,0)']}
            style={styles.glow}
          />
          <LinearGradient
            colors={['rgba(162,155,254,0.14)', 'rgba(162,155,254,0)']}
            style={styles.glowAlt}
          />
        </View>

        <Animated.View
          style={[
            styles.brandTile,
            { opacity: tileOpacity, transform: [{ scale: tileScale }] },
          ]}>
          <Animated.View style={{ transform: [{ translateY: logoShift }] }}>
            <Image source={ASSETS.logo} style={styles.logo} resizeMode="contain" />
          </Animated.View>
        </Animated.View>

        <Animated.View
          style={[styles.titleBlock, { opacity: titleIn, transform: [{ translateY: titleShift }] }]}>
          <Text style={styles.brand}>OROBET</Text>
          <Text style={styles.brandSub}>SCOREBOARD</Text>
        </Animated.View>

        <Animated.Text
          style={[
            styles.tagline,
            { opacity: subtitleIn, transform: [{ translateY: subtitleShift }] },
          ]}>
          PREDICTION TERMINAL · OFFLINE
        </Animated.Text>

        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFillWrap, { width: barWidth }]}>
            <LinearGradient
              colors={THEME.gradients.bar as unknown as string[]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.barFill}
            />
          </Animated.View>
        </View>

        <Animated.Text style={[styles.loading, { opacity: dots }]}>
          LOADING LEAGUE DATA…
        </Animated.Text>
      </Animated.View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  glowWrap: {
    position: 'absolute',
    width: 260,
    height: 260,
    top: '26%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  glowAlt: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
  },
  brandTile: {
    width: 180,
    height: 180,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 148,
    height: 148,
  },
  titleBlock: {
    marginTop: 28,
    alignItems: 'center',
  },
  brand: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 6,
    color: THEME.colors.text,
  },
  brandSub: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 9,
    color: THEME.colors.primary,
  },
  tagline: {
    marginTop: 14,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.4,
    color: THEME.colors.textMuted,
  },
  barTrack: {
    marginTop: 36,
    width: BAR_W,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  barFillWrap: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    width: BAR_W,
    height: 4,
    borderRadius: 2,
  },
  loading: {
    marginTop: 12,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: THEME.colors.textMuted,
  },
});
