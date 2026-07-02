import type { FitnessPoint } from "./model";

export interface PlanDay {
  type: "easy" | "quality" | "long" | "rest";
  label: string;        // e.g. "Easy run", "Tempo intervals", "Long run"
  distanceKm: number | null;
}

export interface Suggestion {
  headline: string;      // e.g. "Easy run · 6km"
  detail: string;        // the reasoning, shown as secondary text
  intensity: "rest" | "recovery" | "easy" | "moderate" | "hard";
  adjusted: boolean;     // true if we downgraded/changed the plan
}

export const DEFAULT_WEEK_TEMPLATE: PlanDay[] = [
  { type: "easy",    label: "Easy run",   distanceKm: 6 },   // Mon
  { type: "quality", label: "Intervals",  distanceKm: 8 },   // Tue
  { type: "rest",    label: "Rest",       distanceKm: null }, // Wed
  { type: "easy",    label: "Easy run",   distanceKm: 6 },   // Thu
  { type: "rest",    label: "Rest",       distanceKm: null }, // Fri
  { type: "long",    label: "Long run",   distanceKm: 16 },  // Sat
  { type: "easy",    label: "Recovery jog", distanceKm: 4 }, // Sun
];

/**
 * Produce today's suggested workout: the plan template for today's weekday,
 * adjusted by current form (fitness - fatigue).
 *
 * Form thresholds (approximate, based on common TSB interpretation):
 *   form < -20  → deeply fatigued: force rest
 *   form < -10  → fatigued: downgrade quality/long to easy, easy to recovery
 *   form >  15  → very fresh: nudge to make quality days count
 *   otherwise   → follow the plan
 */
export function suggestToday(
  template: PlanDay[],
  current: FitnessPoint | null,
  dayOfWeek: number // 0 = Monday ... 6 = Sunday
): Suggestion {
  const plan = template[dayOfWeek] ?? DEFAULT_WEEK_TEMPLATE[dayOfWeek];
  const form = current?.form ?? 0;
  const hasData = current !== null && current.fitness > 0.5;

  // No training data yet: just follow the plan.
  if (!hasData) {
    return {
      headline: planHeadline(plan),
      detail: "Following your weekly plan. Connect Strava and train for a couple of weeks to unlock fatigue-aware suggestions.",
      intensity: planIntensity(plan),
      adjusted: false,
    };
  }

  if (form < -20) {
    return {
      headline: "Rest day",
      detail: `Your form is ${form} — you've accumulated significant fatigue. Taking today off will make your next quality session count.`,
      intensity: "rest",
      adjusted: plan.type !== "rest",
    };
  }

  if (form < -10 && (plan.type === "quality" || plan.type === "long")) {
    const easyKm = plan.distanceKm ? Math.max(4, Math.round(plan.distanceKm * 0.6)) : 5;
    return {
      headline: `Easy run · ${easyKm}km`,
      detail: `Plan says ${plan.label.toLowerCase()}, but your form is ${form} (fatigued). Swapping in an easy effort — move the quality day to later this week.`,
      intensity: "easy",
      adjusted: true,
    };
  }

  if (form < -10 && plan.type === "easy") {
    return {
      headline: `Recovery jog · ${plan.distanceKm ? Math.max(3, Math.round(plan.distanceKm * 0.6)) : 4}km`,
      detail: `Form is ${form} — keeping today extra light so you absorb the recent training.`,
      intensity: "recovery",
      adjusted: true,
    };
  }

  if (form > 15 && plan.type === "quality") {
    return {
      headline: planHeadline(plan),
      detail: `You're fresh (form ${form > 0 ? "+" : ""}${form}) — a great day to hit this session hard.`,
      intensity: "hard",
      adjusted: false,
    };
  }

  return {
    headline: planHeadline(plan),
    detail:
      plan.type === "rest"
        ? "Scheduled rest. Enjoy it — adaptation happens on the days off."
        : `On plan. Current form ${form > 0 ? "+" : ""}${form}.`,
    intensity: planIntensity(plan),
    adjusted: false,
  };
}

function planHeadline(plan: PlanDay): string {
  if (plan.type === "rest") return "Rest day";
  return plan.distanceKm ? `${plan.label} · ${plan.distanceKm}km` : plan.label;
}

function planIntensity(plan: PlanDay): Suggestion["intensity"] {
  switch (plan.type) {
    case "rest": return "rest";
    case "easy": return "easy";
    case "long": return "moderate";
    case "quality": return "hard";
  }
}
