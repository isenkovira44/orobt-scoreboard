import { DAILY_STAKE } from '../constants/config';
import { Slate, generateSlate } from './fixtureGenerator';
import { Club } from './league';

/** YYYYMMDD — everything date dependent reproduces offline on every cold start. */
export function dayIndex(date?: Date): number {
  const d = date || new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export function dailySeed(index: number): number {
  return (index * 2654435761) >>> 0;
}

/** Today's slate is identical on every launch that day. */
export function dailySlate(clubs: Club[], index: number): Slate {
  return generateSlate(clubs, index % 1000, { seedOverride: dailySeed(index) });
}

export function dailyPlayed(lastDailyIndex: number, index: number): boolean {
  return lastDailyIndex === index;
}

export const DAILY_FIXED_STAKE = DAILY_STAKE;

export type DailyRewardStep = { days: number; label: string };

export const DAILY_LADDER: DailyRewardStep[] = [
  { days: 3, label: '3 DAYS = +1 INSIGHT' },
  { days: 7, label: '7 DAYS = BADGE' },
];
