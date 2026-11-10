import { useMemo } from 'react';
import { ANIM, REVEAL_MS_FAST, REVEAL_MS_NORMAL } from '../constants/config';
import { Settings } from '../game/persistence';

export type SettingsView = {
  settings: Settings;
  /** Every animation shortens to 120 ms and drops its loops when REDUCE MOTION is ON. */
  duration: (normal: number) => number;
  loopsEnabled: boolean;
  revealMs: number;
  multiplierFormat: 'decimal' | 'chance';
  bankerHint: boolean;
};

export function useSettings(settings: Settings): SettingsView {
  return useMemo(() => {
    const reduce = settings.reduceMotion;
    return {
      settings,
      duration: (normal: number) => (reduce ? ANIM.reduced : normal),
      loopsEnabled: !reduce,
      revealMs: settings.revealSpeed === 'fast' ? REVEAL_MS_FAST : REVEAL_MS_NORMAL,
      multiplierFormat: settings.multiplierFormat,
      bankerHint: settings.bankerHint,
    };
  }, [settings]);
}

export const SETTING_OPTIONS = {
  multiplierFormat: [
    { value: 'decimal' as const, label: 'DECIMAL' },
    { value: 'chance' as const, label: 'CHANCE' },
  ],
  revealSpeed: [
    { value: 'normal' as const, label: 'NORMAL' },
    { value: 'fast' as const, label: 'FAST' },
  ],
  toggle: [
    { value: true, label: 'ON' },
    { value: false, label: 'OFF' },
  ],
};
