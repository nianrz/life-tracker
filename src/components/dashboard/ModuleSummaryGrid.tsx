"use client";

import { useMemo } from "react";
import { FitnessSummaryCard } from "@/components/dashboard/FitnessSummaryCard";
import { StudentSummaryCard } from "@/components/dashboard/StudentSummaryCard";
import { FinanceSummaryCard } from "@/components/dashboard/FinanceSummaryCard";
import { useCrud } from "@/lib/db/useCrud";
import { workoutsRepo } from "@/lib/db/repositories/workouts";
import { deliverablesRepo } from "@/lib/db/repositories/deliverables";
import { transactionsRepo } from "@/lib/db/repositories/transactions";
import type { Workout } from "@/lib/modules/fitness";
import type { Deliverable } from "@/lib/modules/student";
import type { Transaction } from "@/lib/modules/finance";

function isThisMonth(iso: string): boolean {
  const now = new Date();
  const d = new Date(iso + "T00:00:00");
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export function ModuleSummaryGrid() {
  const workouts = useCrud<Workout>(workoutsRepo);
  const deliverables = useCrud<Deliverable>(deliverablesRepo);
  const transactions = useCrud<Transaction>(transactionsRepo);

  const sortedWorkouts = useMemo(
    () => [...workouts.items].sort((a, b) => a.date.localeCompare(b.date)),
    [workouts.items]
  );

  const upcomingDeliverables = useMemo(
    () =>
      [...deliverables.items]
        .filter((d) => !d.done)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 5),
    [deliverables.items]
  );

  const { income, expenses } = useMemo(() => {
    const thisMonth = transactions.items.filter((t) => isThisMonth(t.date));
    return {
      income: thisMonth.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0),
      expenses: Math.abs(thisMonth.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0)),
    };
  }, [transactions.items]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <FitnessSummaryCard week={sortedWorkouts} />
      <StudentSummaryCard upcoming={upcomingDeliverables} />
      <FinanceSummaryCard income={income} expenses={expenses} />
    </div>
  );
}
