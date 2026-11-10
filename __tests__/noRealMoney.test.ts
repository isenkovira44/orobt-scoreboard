import fs from 'fs';
import path from 'path';

const SRC = path.join(__dirname, '..', 'src');

function walk(dir: string, out: string[] = []): string[] {
  fs.readdirSync(dir).forEach(name => {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      walk(full, out);
    } else if (/\.tsx?$/.test(name)) {
      out.push(full);
    }
  });
  return out;
}

const FILES = walk(SRC);
const SOURCE = FILES.map(f => fs.readFileSync(f, 'utf8')).join('\n');

describe('no real money and no network', () => {
  it('reads every source file', () => {
    expect(FILES.length).toBeGreaterThan(20);
  });

  it('contains no purchase, billing or advertising path', () => {
    [
      'react-native-iap',
      'InAppPurchase',
      'billing',
      'AdMob',
      'admob',
      'paywall',
      'subscription',
      'withdraw',
      'deposit',
      'creditCard',
    ].forEach(token => expect(SOURCE).not.toContain(token));
  });

  it('contains no network code', () => {
    ['fetch(', 'XMLHttpRequest', 'WebSocket', 'axios', 'https://', 'http://'].forEach(token =>
      expect(SOURCE).not.toContain(token),
    );
  });

  it('states the fair-play line in the app', () => {
    expect(SOURCE).toContain('FICTIONAL POINTS ONLY');
    expect(SOURCE).toContain('NO REAL-MONEY BETTING');
  });

  it('uses only fictional score points', () => {
    expect(SOURCE).toContain('SP');
    ['USD', 'EUR', '$', 'real money prize'].forEach(token => {
      expect(SOURCE.indexOf(token + ' payout')).toBe(-1);
    });
  });
});
