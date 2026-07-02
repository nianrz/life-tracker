import { todayIso, addDays } from "@/lib/dates";

export interface ActivityLoad {
  localDate: string; // YYYY-MM-DD
  sufferScore: number | null;
  movingTimeS: number;
  avgHr: number | null;
}

export interface FitnessPoint {
  date: string;
  fitness: number;   // long-term training load (CTL), 42-day decay
  fatigue: number;   // short-term training load (ATL), 7-day decay
  form: number;      // fitness - fatigue (TSB)
}

/**
 * Estimate a training load for an activity when suffer_score is missing.
 * Very rough fallback: ~1 point per 2 minutes of moving time, scaled up
 * if average HR is high. Real suffer_score is always preferred.
 */
function estimateLoad(a: ActivityLoad): number {
  if (a.sufferScore != null) return a.sufferScore;
  const base = a.movingTimeS / 120; // 1 pt / 2 min
  if (a.avgHr != null && a.avgHr > 150) return base * 1.5;
  return base;
}

/**
 * Compute the fitness/fatigue/form time series from daily training loads,
 * using the same impulse-response model Strava (and TrainingPeaks) use:
 *
 *   fitness_today = fitness_yesterday + (load_today - fitness_yesterday) / 42
 *   fatigue_today = fatigue_yesterday + (load_today - fatigue_yesterday) / 7
 *   form          = fitness - fatigue
 *
 * Returns one point per day from `days` ago through today.
 */
export function computeFitnessSeries(
  activities: ActivityLoad[],
  days: number = 90
): FitnessPoint[] {
  // Sum load per day
  const loadByDate = new Map<string, number>();
  for (const a of activities) {
    loadByDate.set(a.localDate, (loadByDate.get(a.localDate) ?? 0) + estimateLoad(a));
  }

  const today = todayIso();
  const start = addDays(today, -days);

  const series: FitnessPoint[] = [];
  let fitness = 0;
  let fatigue = 0;

  let cursor = start;
  while (cursor <= today) {
    const load = loadByDate.get(cursor) ?? 0;
    fitness = fitness + (load - fitness) / 42;
    fatigue = fatigue + (load - fatigue) / 7;
    series.push({
      date: cursor,
      fitness: Math.round(fitness * 10) / 10,
      fatigue: Math.round(fatigue * 10) / 10,
      form: Math.round((fitness - fatigue) * 10) / 10,
    });
    cursor = addDays(cursor, 1);
  }

  return series;
}

export function currentFitness(series: FitnessPoint[]): FitnessPoint | null {
  return series.length > 0 ? series[series.length - 1] : null;
}

/** Fitness change over the last N days, for the trend arrow. */
export function fitnessTrend(series: FitnessPoint[], days: number = 7): number {
  if (series.length < days + 1) return 0;
  const now = series[series.length - 1].fitness;
  const then = series[series.length - 1 - days].fitness;
  return Math.round((now - then) * 10) / 10;
}
