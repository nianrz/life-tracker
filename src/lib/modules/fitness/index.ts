import type { ModuleDefinition, Task, DashboardSummary } from "@/lib/types/core";

export type WorkoutType = "run" | "hike" | "rest" | "strength" | "other";
export type EventType = "race" | "hike" | "ride" | "other";

export interface Workout {
  id: string;
  date: string; // ISO date
  title: string; // e.g. "Easy run"
  distanceKm: number | null;
  type: WorkoutType;
  notes: string;
  completed: boolean;
}

// A fitness "event" is distinct from a routine workout -- races, hikes,
// trips: things with more planning detail, not part of the weekly grind.
export interface FitnessEvent {
  id: string;
  date: string; // ISO date
  title: string;
  type: EventType;
  distanceKm: number | null;
  location: string;
  notes: string;
}

export const FITNESS_WORKOUTS_KEY = "lifetracker.fitness.workouts";
export const FITNESS_EVENTS_KEY = "lifetracker.fitness.events";

// Seed data: used both as the localStorage seed (client-side CRUD) and as
// the fallback for server-rendered dashboard summaries.
export const SEED_WORKOUTS: Workout[] = [
  { id: "w1", date: "2026-06-29", title: "Easy run", distanceKm: 6, type: "run", notes: "", completed: true },
  { id: "w2", date: "2026-06-30", title: "Long run", distanceKm: 18, type: "run", notes: "4:1 run-walk pacing", completed: false },
  { id: "w3", date: "2026-07-01", title: "Rest", distanceKm: null, type: "rest", notes: "", completed: false },
  { id: "w4", date: "2026-07-02", title: "Tempo run", distanceKm: 8, type: "run", notes: "", completed: false },
  { id: "w5", date: "2026-07-03", title: "Rest", distanceKm: null, type: "rest", notes: "", completed: false },
  { id: "w6", date: "2026-07-04", title: "Mt. Ugo hike", distanceKm: 24, type: "hike", notes: "Bring headlamp, 2D1N", completed: false },
  { id: "w7", date: "2026-07-05", title: "Recovery jog", distanceKm: 4, type: "run", notes: "", completed: false },
];

export const SEED_EVENTS: FitnessEvent[] = [
  { id: "ev1", date: "2026-07-04", title: "Mt. Ugo hike", type: "hike", distanceKm: 24, location: "Benguet/Nueva Vizcaya", notes: "2D1N with the usual group" },
  { id: "ev2", date: "2026-08-16", title: "Milo Marathon (half)", type: "race", distanceKm: 21, location: "Quezon City", notes: "Target 5:40 net, 4:1 run-walk, 5 gels" },
];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

async function getTodayTasks(userId: string): Promise<Task[]> {
  const today = SEED_WORKOUTS.find((w) => w.date === todayIso());
  if (!today || today.type === "rest") return [];

  return [
    {
      id: `auto-fitness-${today.id}`,
      userId,
      title: `${today.title}${today.distanceKm ? ` · ${today.distanceKm}km` : ""}`,
      done: today.completed,
      dueDate: today.date,
      module: "fitness",
      source: "auto",
      sourceRef: today.id,
      createdAt: new Date().toISOString(),
    },
  ];
}

async function getDashboardSummary(_userId: string): Promise<DashboardSummary> {
  const totalKm = SEED_WORKOUTS.reduce((sum, w) => sum + (w.distanceKm ?? 0), 0);
  return {
    module: "fitness",
    headline: `${totalKm}km planned this week`,
    data: { week: SEED_WORKOUTS },
  };
}

export const fitnessModule: ModuleDefinition = {
  id: "fitness",
  label: "Fitness",
  icon: "run",
  route: "/fitness",
  color: "teal",
  getTodayTasks,
  getDashboardSummary,
};
