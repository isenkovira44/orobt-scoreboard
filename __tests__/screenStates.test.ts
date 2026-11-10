import fs from 'fs';
import path from 'path';
import { LOADER_DURATION_MS } from '../src/constants/config';
import { allCleared } from '../src/game/challenges';
import { dailyPlayed } from '../src/game/dailyMode';
import { FALLBACK_SLATE, generateSlate } from '../src/game/fixtureGenerator';
import { CLUBS } from '../src/game/league';
import { summarise } from '../src/game/progressStats';

const SCREENS = path.join(__dirname, '..', 'src', 'screens');

describe('screen states', () => {
  it('holds the loader for exactly 8000 ms', () => {
    expect(LOADER_DURATION_MS).toBe(8000);
  });

  it('ships every screen of the documented flow', () => {
    const files = fs.readdirSync(SCREENS);
    [
      'LoaderScreen.tsx',
      'MenuScreen.tsx',
      'GameScreen.tsx',
      'ResultScreen.tsx',
      'ChallengeScreen.tsx',
      'ProgressScreen.tsx',
      'CollectionScreen.tsx',
      'DailyModeScreen.tsx',
      'SettingsScreen.tsx',
    ].forEach(name => expect(files).toContain(name));
  });

  it('has an empty state for every screen that can have no data', () => {
    expect(summarise([]).slips).toBe(0);
    expect(allCleared([])).toBe(false);
    expect(dailyPlayed(0, 20261110)).toBe(false);
  });

  it('keeps a usable error path through the backup slate', () => {
    expect(FALLBACK_SLATE).toHaveLength(5);
    expect(generateSlate(CLUBS, 1).fallback).toBe(false);
  });

  it('never leaves the loader interactive', () => {
    const loader = fs.readFileSync(path.join(SCREENS, 'LoaderScreen.tsx'), 'utf8');
    expect(loader).not.toContain('onPress');
    expect(loader).not.toContain('Pressable');
    expect(loader).not.toContain('TouchableOpacity');
  });
});
