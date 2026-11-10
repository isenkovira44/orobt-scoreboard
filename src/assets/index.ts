/**
 * The fixed Codex asset contract. No other image name exists — never invent one.
 */
export const ASSETS = {
  bgGame: require('../../assets/bg_game.png'),
  logo: require('../../assets/logo.png'),
  iconHome: require('../../assets/icon_home.png'),
  iconPause: require('../../assets/icon_pause.png'),
  buttonRect: require('../../assets/button_rect.png'),
  buttonRound: require('../../assets/button_round.png'),
  sprite1: require('../../assets/sprite_1.png'),
  sprite2: require('../../assets/sprite_2.png'),
  sprite3: require('../../assets/sprite_3.png'),
  sprite4: require('../../assets/sprite_4.png'),
  sprite5: require('../../assets/sprite_5.png'),
};

/** Club crests — sprite_1..sprite_5, used by index. */
export const CRESTS = [
  ASSETS.sprite1,
  ASSETS.sprite2,
  ASSETS.sprite3,
  ASSETS.sprite4,
  ASSETS.sprite5,
];

export function crestFor(index: number) {
  return CRESTS[((index % CRESTS.length) + CRESTS.length) % CRESTS.length];
}
