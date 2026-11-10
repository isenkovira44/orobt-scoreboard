export function formatSP(value: number): string {
  const n = Math.round(value);
  const sign = n < 0 ? '-' : '';
  return sign + Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatDelta(value: number): string {
  const n = Math.round(value);
  return (n > 0 ? '+' : '') + formatSP(n) + ' SP';
}

export function formatMultiplier(value: number): string {
  return 'x' + value.toFixed(2);
}

export function formatPercent(value: number): string {
  return Math.round(value * 100) + '%';
}

/** Settings option MULTIPLIER FORMAT: 'decimal' prints x1.85, 'chance' prints 54%. */
export function formatOdds(odds: number, format: 'decimal' | 'chance'): string {
  if (format === 'chance') {
    return Math.round((1 / odds) * 100) + '%';
  }
  return formatMultiplier(odds);
}

export function formatDayIndex(dayIndex: number): string {
  const s = String(dayIndex);
  return s.slice(6, 8) + '.' + s.slice(4, 6) + '.' + s.slice(0, 4);
}
