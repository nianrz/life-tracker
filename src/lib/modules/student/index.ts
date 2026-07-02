import type { ModuleDefinition, Task, DashboardSummary } from "@/lib/types/core";

export type DeliverableType = "project" | "exam" | "quiz" | "paper" | "other";

export interface Deliverable {
  id: string;
  title: string;
  course: string;
  type: DeliverableType;
  dueDate: string; // ISO date
  weight: number | null; // % of grade, if known
  grade: number | null; // % score once graded, null if ungraded
  done: boolean;
}

export const STUDENT_DELIVERABLES_KEY = "lifetracker.student.deliverables";

// Seed data: used both as the localStorage seed (client-side CRUD) and as
// the fallback for server-rendered dashboard summaries.
export const SEED_DELIVERABLES: Deliverable[] = [
  { id: "d1", title: "THS-ST1 chapter 4 draft", course: "Thesis", type: "paper", dueDate: "2026-07-02", weight: null, grade: null, done: false },
  { id: "d2", title: "OS midterm exam", course: "CSOPESY", type: "exam", dueDate: "2026-07-02", weight: 25, grade: null, done: false },
  { id: "d3", title: "MCO1 scheduler demo", course: "CSOPESY", type: "project", dueDate: "2026-07-09", weight: 20, grade: null, done: false },
  { id: "d4", title: "Ethics review resubmission", course: "Thesis", type: "other", dueDate: "2026-07-11", weight: null, grade: null, done: false },
  { id: "d5", title: "Quiz 3", course: "CSOPESY", type: "quiz", dueDate: "2026-07-14", weight: 5, grade: null, done: false },
];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

async function getTodayTasks(userId: string): Promise<Task[]> {
  const today = todayIso();
  return SEED_DELIVERABLES.filter((d) => d.dueDate === today && !d.done).map((d) => ({
    id: `auto-student-${d.id}`,
    userId,
    title: d.title,
    done: d.done,
    dueDate: d.dueDate,
    module: "student",
    source: "auto",
    sourceRef: d.id,
    createdAt: new Date().toISOString(),
  }));
}

async function getDashboardSummary(_userId: string): Promise<DashboardSummary> {
  const upcoming = [...SEED_DELIVERABLES]
    .filter((d) => !d.done)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  return {
    module: "student",
    headline: `${upcoming.length} upcoming deliverables`,
    data: { upcoming },
  };
}

export const studentModule: ModuleDefinition = {
  id: "student",
  label: "Student",
  icon: "school",
  route: "/student",
  color: "purple",
  getTodayTasks,
  getDashboardSummary,
};
