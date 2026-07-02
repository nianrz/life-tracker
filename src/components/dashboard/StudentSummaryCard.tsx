import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { todayIso, addDays, formatShortDate } from "@/lib/dates";
import type { Deliverable } from "@/lib/modules/student";

export function StudentSummaryCard({ upcoming }: { upcoming: Deliverable[] }) {
  const today = todayIso();
  const threeDaysOut = addDays(today, 3);

  return (
    <Link href="/student" className="block">
      <Card className="h-full hover:border-[var(--border-strong)] transition-colors">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap size={18} className="text-[var(--module-student-text)]" />
          <h3 className="text-[16px] font-medium">Student</h3>
        </div>
        <p className="text-[13px] text-[var(--text-secondary)] mb-2">Upcoming</p>
        <div className="flex flex-col gap-1.5 text-[13px]">
          {upcoming.map((d) => {
            const soon = d.dueDate <= threeDaysOut;
            return (
              <div key={d.id} className="flex justify-between">
                <span className="truncate pr-2">{d.title}</span>
                <span className={soon ? "text-[var(--text-danger)] shrink-0" : "text-[var(--text-secondary)] shrink-0"}>
                  {formatShortDate(d.dueDate)}
                </span>
              </div>
            );
          })}
          {upcoming.length === 0 && (
            <p className="text-[var(--text-muted)]">Nothing upcoming.</p>
          )}
        </div>
      </Card>
    </Link>
  );
}
