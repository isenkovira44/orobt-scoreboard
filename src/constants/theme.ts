/**
 * DARK_PREMIUM preset, BENTO_GRID style.
 * Only the primary accent is overridden (#6C5CE7 -> #00E27A, the Orobet action colour).
 */
export const THEME = {
  name: 'DARK_PREMIUM',

  colors: {
    bg: '#111114',
    surface: '#18181C',
    surfaceAlt: '#1F1F24',
    elevated: '#252530',

    primary: '#00E27A',
    primaryDeep: '#00B964',
    secondary: '#A29BFE',
    gold: '#E0B15C',
    miss: '#FF5C7A',

    text: '#F5F5F7',
    textSecondary: '#A0A0AC',
    textMuted: '#6E6E7A',

    hairline: 'rgba(255,255,255,0.07)',
    hairlineStrong: 'rgba(255,255,255,0.12)',
    fill: 'rgba(255,255,255,0.05)',
    onPrimary: '#06130C',
  },

  gradients: {
    loader: ['#05050A', '#111114', '#0C1A12'],
    menu: ['rgba(17,17,20,0.72)', 'rgba(17,17,20,0.90)', 'rgba(10,26,18,0.94)'],
    screen: ['rgba(17,17,20,0.80)', 'rgba(17,17,20,0.92)', 'rgba(12,26,18,0.95)'],
    game: ['rgba(10,10,14,0.86)', 'rgba(17,17,20,0.93)', 'rgba(12,26,18,0.96)'],
    resultWin: ['rgba(0,226,122,0.22)', 'rgba(17,17,20,0.96)'],
    resultLose: ['rgba(255,92,122,0.16)', 'rgba(17,17,20,0.96)'],
    resultNeutral: ['rgba(10,26,18,0.88)', 'rgba(17,17,20,0.96)'],
    cta: ['#00E27A', '#00B964'],
    bar: ['#00E27A', '#A29BFE'],
  },

  radius: { sm: 10, md: 12, lg: 16, xl: 18, xxl: 22 },

  tile: {
    backgroundColor: '#18181C',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  type: {
    hero: { fontSize: 40, fontWeight: '900' as const, letterSpacing: 6 },
    headline: { fontSize: 34, fontWeight: '900' as const, letterSpacing: 1.5 },
    title: { fontSize: 24, fontWeight: '900' as const, letterSpacing: 1.2 },
    section: { fontSize: 18, fontWeight: '800' as const, letterSpacing: 0.8 },
    tileTitle: { fontSize: 13, fontWeight: '800' as const, letterSpacing: 0.8 },
    body: { fontSize: 15, fontWeight: '600' as const },
    small: { fontSize: 12, fontWeight: '600' as const },
    caption: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 2 },
    label: { fontSize: 10, fontWeight: '600' as const, letterSpacing: 1.6 },
    micro: { fontSize: 9, fontWeight: '700' as const, letterSpacing: 1.4 },
  },

  icon: { stroke: 1.5, sm: 16, md: 20, lg: 22, xl: 24 },
} as const;

export const NUM = { fontVariant: ['tabular-nums' as const] };

export type Theme = typeof THEME;
