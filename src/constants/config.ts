import { Dimensions } from 'react-native';

/** Splash holds exactly 8000 ms, timer driven, no tap-to-skip. */
export const LOADER_DURATION_MS = 8000;
export const LOADER_PROGRESS_MS = 7600;

/** Per-leg settlement reveal cadence. */
export const REVEAL_MS_NORMAL = 600;
export const REVEAL_MS_FAST = 250;
/** Once the slip can no longer pay, the rest fast-settles so Result is reached in ~3 s. */
export const REVEAL_MS_DECIDED = 250;

export const FIXTURES_PER_SLATE = 5;
export const MIN_LEGS = 3;
export const MAX_LEGS = 5;

export const STARTING_BALANCE = 1000;
export const STAKES = [50, 100, 250] as const;
export const DAILY_STAKE = 100;
export const MIN_STAKE = 50;
export const TOP_UP_AMOUNT = 500;
export const TOP_UP_THRESHOLD = 50;

export const BANKER_BOOST = 1.5;
export const CASH_OUT_RATE = 0.7;
export const STARTING_TOKENS = 2;

export const ODDS_MIN = 1.08;
export const ODDS_MAX = 12.0;
export const OROBET_EDGE = 0.94;

export const MAX_SLATE_ATTEMPTS = 20;
export const HISTORY_LIMIT = 10;

export const ANIM = {
  press: { tension: 300, friction: 12 },
  enter: { tension: 48, friction: 8 },
  fade: 220,
  screen: 260,
  reduced: 120,
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
export { SCREEN_W, SCREEN_H };

/** Board geometry — the card width is rebuilt from the pick width so nothing overflows. */
export const BOARD_MAX_W = Math.min(SCREEN_W - 32, 380);
export const BOARD_PAD = 10;
export const BOARD_BORDER = 1;
export const BOARD_FRAME = BOARD_PAD + BOARD_BORDER;
export const PICK_GAP = 8;
const RAW_CARD_W = BOARD_MAX_W - 2 * BOARD_FRAME;
export const PICK_W = Math.floor((RAW_CARD_W - 2 * PICK_GAP) / 3);
export const CARD_W = PICK_W * 3 + 2 * PICK_GAP + 2 * BOARD_FRAME;
export const CARD_H = 132;
export const CARD_H_SETTLED = 64;

/** Collection grid — computed inside the frame, same rule as the board. */
export const GRID_W = Math.min(SCREEN_W - 32, 380);
export const GRID_FRAME = 11;
export const GRID_GAP = 8;
export const TILE_W = Math.floor((GRID_W - 2 * GRID_FRAME - 2 * GRID_GAP) / 3);

export const HEADER_TOP_PAD = 44;
