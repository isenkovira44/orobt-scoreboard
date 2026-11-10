import { useCallback, useMemo, useRef } from 'react';
import { Animated } from 'react-native';
import { ANIM } from '../constants/config';

/**
 * Press feedback on this stack: Pressable is the PARENT and drives an Animated.spring
 * on transform scale (native driver). The Animated.View is a CHILD inside the Pressable,
 * so nothing can swallow the press. No gesture-handler anywhere.
 */
export function usePressScale(to: number = 0.97) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      tension: ANIM.press.tension,
      friction: ANIM.press.friction,
    }).start();
  }, [scale, to]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: ANIM.press.tension,
      friction: ANIM.press.friction,
    }).start();
  }, [scale]);

  const style = useMemo(() => ({ transform: [{ scale }] }), [scale]);

  return { scale, style, onPressIn, onPressOut };
}
