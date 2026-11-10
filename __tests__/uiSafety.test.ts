import fs from 'fs';
import path from 'path';

const SRC = path.join(__dirname, '..', 'src');

function walk(dir: string, out: string[] = []): string[] {
  fs.readdirSync(dir).forEach(name => {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      walk(full, out);
    } else if (/\.tsx$/.test(name)) {
      out.push(full);
    }
  });
  return out;
}

const FILES = walk(SRC).concat(path.join(__dirname, '..', 'App.tsx'));
const SOURCE = FILES.map(f => fs.readFileSync(f, 'utf8')).join('\n');

describe('ui safety rules', () => {
  it('never drives a layout property with the native driver', () => {
    const blocks = SOURCE.split('Animated.timing').slice(1);
    blocks.forEach(block => {
      const head = block.slice(0, 260);
      if (/useNativeDriver:\s*true/.test(head)) {
        expect(/toValue[\s\S]{0,80}(width|height|margin|padding|top|bottom|left|right):/.test(head)).toBe(
          false,
        );
      }
    });
    expect(SOURCE).toContain('useNativeDriver: false');
  });

  it('uses no tofu-prone glyphs in user-visible text', () => {
    ['›', '‹', '▸', '▶', '▾', '▴', '→', '←', '⇒'].forEach(
      glyph => expect(SOURCE).not.toContain(glyph),
    );
  });

  it('uses no emoji as icons', () => {
    expect(/[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(SOURCE)).toBe(false);
  });

  it('adds no forbidden native dependency', () => {
    ['react-native-gesture-handler', 'GestureDetector', 'GestureHandlerRootView', 'async-storage'].forEach(
      token => expect(SOURCE).not.toContain(token),
    );
  });

  it('references only the fixed asset contract names', () => {
    const assets = fs.readFileSync(path.join(SRC, 'assets', 'index.ts'), 'utf8');
    const names = (assets.match(/assets\/([a-z0-9_]+)\.png/g) || []).map(m =>
      m.replace('assets/', '').replace('.png', ''),
    );
    const allowed = [
      'bg_game',
      'logo',
      'icon_home',
      'icon_pause',
      'button_rect',
      'button_round',
      'sprite_1',
      'sprite_2',
      'sprite_3',
      'sprite_4',
      'sprite_5',
    ];
    expect(names.length).toBe(11);
    names.forEach(name => expect(allowed).toContain(name));
  });
});
