import { Rng } from './rng';

export type FormResult = 'W' | 'D' | 'L';

export type Club = {
  id: string;
  name: string;
  short: string;
  region: string;
  crestIndex: number;
  attack: number;
  defense: number;
  form: FormResult[];
};

/** The Orobet Prime League — fictional clubs, fictional points, no real money. */
export const CLUBS: Club[] = [
  { id: 'hrv', name: 'HARBOUR ROVERS', short: 'HRV', region: 'COAST', crestIndex: 0, attack: 84, defense: 76, form: ['W', 'W', 'D', 'W', 'L'] },
  { id: 'grc', name: 'GRANITE CITY FC', short: 'GRC', region: 'NORTH', crestIndex: 1, attack: 79, defense: 82, form: ['W', 'D', 'W', 'D', 'W'] },
  { id: 'vla', name: 'VALE ATHLETIC', short: 'VLA', region: 'VALLEY', crestIndex: 2, attack: 71, defense: 68, form: ['L', 'W', 'L', 'D', 'W'] },
  { id: 'npu', name: 'NORTH PIER UNITED', short: 'NPU', region: 'COAST', crestIndex: 3, attack: 88, defense: 70, form: ['W', 'W', 'W', 'L', 'W'] },
  { id: 'ops', name: 'ORCHARD PARK SC', short: 'OPS', region: 'VALLEY', crestIndex: 4, attack: 66, defense: 73, form: ['D', 'L', 'D', 'W', 'L'] },
  { id: 'imt', name: 'IRON MILL TOWN', short: 'IMT', region: 'NORTH', crestIndex: 0, attack: 74, defense: 86, form: ['D', 'W', 'W', 'D', 'D'] },
  { id: 'sbc', name: 'SABLE COAST FC', short: 'SBC', region: 'COAST', crestIndex: 1, attack: 61, defense: 59, form: ['L', 'L', 'D', 'L', 'W'] },
  { id: 'kea', name: 'KESTREL ALBION', short: 'KEA', region: 'NORTH', crestIndex: 2, attack: 69, defense: 64, form: ['W', 'L', 'D', 'L', 'D'] },
  { id: 'mla', name: 'MEADOW LANE AC', short: 'MLA', region: 'VALLEY', crestIndex: 3, attack: 58, defense: 55, form: ['L', 'D', 'L', 'L', 'D'] },
  { id: 'cpw', name: 'COPPERFIELD WANDERERS', short: 'CPW', region: 'NORTH', crestIndex: 4, attack: 77, defense: 71, form: ['D', 'W', 'L', 'W', 'W'] },
];

const FORM_POINTS: Record<FormResult, number> = { W: 3, D: 1, L: 0 };

/** Last-5 points, 0..15 — drives the form bars on the fixture card. */
export function formPoints(form: FormResult[]): number {
  return form.slice(-5).reduce((sum, r) => sum + FORM_POINTS[r], 0);
}

export function clubById(clubs: Club[], id: string): Club {
  const found = clubs.find(c => c.id === id);
  return found || clubs[0];
}

export function clampRating(value: number): number {
  return Math.max(45, Math.min(95, Math.round(value)));
}

export type MatchOutcomeRecord = { homeId: string; awayId: string; outcome: 0 | 1 | 2 };

/**
 * Ratings drift +/-3 per matchday from the simulated results, so the table is alive
 * instead of static sample data and carries into the next matchday.
 */
export function driftLeague(clubs: Club[], records: MatchOutcomeRecord[]): Club[] {
  const next = clubs.map(c => ({ ...c, form: c.form.slice() }));
  records.forEach(rec => {
    const home = next.find(c => c.id === rec.homeId);
    const away = next.find(c => c.id === rec.awayId);
    if (!home || !away) {
      return;
    }
    if (rec.outcome === 0) {
      home.attack = clampRating(home.attack + 3);
      away.defense = clampRating(away.defense - 3);
      home.form.push('W');
      away.form.push('L');
    } else if (rec.outcome === 2) {
      away.attack = clampRating(away.attack + 3);
      home.defense = clampRating(home.defense - 3);
      away.form.push('W');
      home.form.push('L');
    } else {
      home.defense = clampRating(home.defense + 1);
      away.defense = clampRating(away.defense + 1);
      home.form.push('D');
      away.form.push('D');
    }
    home.form = home.form.slice(-5);
    away.form = away.form.slice(-5);
  });
  return next;
}

/** H2H record carried as a deterministic function of the pair, shown as 3-1-1. */
export function headToHead(homeId: string, awayId: string): [number, number, number] {
  let h = 0;
  const key = homeId + awayId;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  const a = h % 4;
  const b = (h >>> 3) % 3;
  const c = 5 - a - b;
  return [a, b, Math.max(0, c)];
}
