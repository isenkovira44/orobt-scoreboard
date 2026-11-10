/**
 * Orobet Scoreboard — offline prediction terminal.
 * Navigation is a state machine held here; there is no navigation library.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, StatusBar, StyleSheet, View } from 'react-native';
import { ANIM } from './src/constants/config';
import { THEME } from './src/constants/theme';
import { ChallengeId } from './src/game/challenges';
import { RoundInput, RoundSummary, useGameState } from './src/hooks/useGameState';
import { MatchdayMode } from './src/hooks/useMatchday';
import { ChallengeScreen } from './src/screens/ChallengeScreen';
import { CollectionScreen } from './src/screens/CollectionScreen';
import { DailyModeScreen } from './src/screens/DailyModeScreen';
import { GameScreen } from './src/screens/GameScreen';
import { LoaderScreen } from './src/screens/LoaderScreen';
import { MenuScreen } from './src/screens/MenuScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

type Screen =
  | 'loader'
  | 'menu'
  | 'game'
  | 'result'
  | 'challenge'
  | 'progress'
  | 'collection'
  | 'daily'
  | 'settings';

export default function App() {
  const game = useGameState();
  const [screen, setScreen] = useState<Screen>('loader');
  const [mode, setMode] = useState<MatchdayMode>('normal');
  const [challenge, setChallenge] = useState<ChallengeId | null>(null);
  const [summary, setSummary] = useState<RoundSummary | null>(null);
  const [gameKey, setGameKey] = useState(0);

  const fade = useRef(new Animated.Value(1)).current;
  const screenRef = useRef<Screen>(screen);
  screenRef.current = screen;

  const reduceMotion = game.save.settings.reduceMotion;

  /** Screen changes fade rather than snapping. */
  const go = useCallback(
    (next: Screen) => {
      const duration = reduceMotion ? ANIM.reduced : 180;
      Animated.timing(fade, { toValue: 0, duration, useNativeDriver: true }).start(() => {
        setScreen(next);
        Animated.timing(fade, {
          toValue: 1,
          duration: reduceMotion ? ANIM.reduced : ANIM.screen,
          useNativeDriver: true,
        }).start();
      });
    },
    [fade, reduceMotion],
  );

  const goMenu = useCallback(() => go('menu'), [go]);

  const startMatchday = useCallback(
    (nextMode: MatchdayMode, nextChallenge: ChallengeId | null) => {
      setMode(nextMode);
      setChallenge(nextChallenge);
      setGameKey(k => k + 1);
      go('game');
    },
    [go],
  );

  const startNormal = useCallback(() => startMatchday('normal', null), [startMatchday]);
  const startDaily = useCallback(() => startMatchday('daily', null), [startMatchday]);
  const startChallenge = useCallback(
    (id: ChallengeId) => startMatchday('challenge', id),
    [startMatchday],
  );

  const handleFinish = useCallback(
    (input: RoundInput) => {
      setSummary(game.commitRound(input));
      go('result');
    },
    [game, go],
  );

  const openFromMenu = useCallback(
    (next: 'daily' | 'challenge' | 'progress' | 'collection' | 'settings') => go(next),
    [go],
  );

  // System Back goes to the previous screen; on Menu it closes the app.
  useEffect(() => {
    const onBack = () => {
      const current = screenRef.current;
      if (current === 'menu' || current === 'loader') {
        return false;
      }
      go('menu');
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => {
      sub.remove();
    };
  }, [go]);

  const loaderDone = useCallback(() => setScreen('menu'), []);

  let body: React.ReactNode = null;
  if (screen === 'loader') {
    body = <LoaderScreen onDone={loaderDone} />;
  } else if (screen === 'menu') {
    body = (
      <MenuScreen
        save={game.save}
        canTopUp={game.canTopUp}
        onTopUp={game.claimTopUp}
        onPlay={startNormal}
        onOpen={openFromMenu}
      />
    );
  } else if (screen === 'game') {
    body = (
      <GameScreen
        key={gameKey}
        save={game.save}
        mode={mode}
        challenge={challenge}
        onBack={goMenu}
        onPlaceStake={game.placeStake}
        onFinish={handleFinish}
      />
    );
  } else if (screen === 'result' && summary) {
    body = (
      <ResultScreen
        summary={summary}
        save={game.save}
        canTopUp={game.canTopUp}
        onTopUp={game.claimTopUp}
        onAgain={startNormal}
        onMenu={goMenu}
        onProgress={() => go('progress')}
        onCollection={() => go('collection')}
      />
    );
  } else if (screen === 'challenge') {
    body = <ChallengeScreen save={game.save} onBack={goMenu} onStart={startChallenge} />;
  } else if (screen === 'progress') {
    body = <ProgressScreen save={game.save} onBack={goMenu} onPlay={startNormal} />;
  } else if (screen === 'collection') {
    body = <CollectionScreen save={game.save} onBack={goMenu} onPlay={startNormal} />;
  } else if (screen === 'daily') {
    body = <DailyModeScreen save={game.save} onBack={goMenu} onStart={startDaily} />;
  } else if (screen === 'settings') {
    body = (
      <SettingsScreen
        save={game.save}
        onBack={goMenu}
        onChange={game.setSetting}
        onReset={game.resetAll}
      />
    );
  } else {
    body = (
      <MenuScreen
        save={game.save}
        canTopUp={game.canTopUp}
        onTopUp={game.claimTopUp}
        onPlay={startNormal}
        onOpen={openFromMenu}
      />
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Animated.View style={[styles.layer, { opacity: fade }]} pointerEvents="box-none">
        {body}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
  },
  layer: {
    flex: 1,
  },
});
