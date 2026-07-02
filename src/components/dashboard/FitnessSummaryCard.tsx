import Link from "next/link";
import { PersonStanding } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { Workout } from "@/lib/modules/fitness";

function dayLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

export function FitnessSummaryCard({ week }: { week: Workout[] }) {
  return (
    <Link href="/fitness" className="block">
      <Card className="h-full hover:border-[var(--border-strong)] transition-colors">
        <div className="flex items-center gap-2 mb-3">
          <PersonStanding size={18} className="text-[var(--module-fitness-text)]" />
          <h3 className="text-[16px] font-medium">Fitness</h3>
        </div>
        <p className="text-[13px] text-[var(--text-secondary)] mb-2">This week</p>
        <div className="flex flex-col gap-1.5 text-[13px]">
          {week.slice(0, 4).map((w) => (
            <div key={w.id} className="flex justify-between">
              <span>
                {dayLabel(w.date)} · {w.title}
              </span>
              <span className="text-[var(--text-secondary)]">
                {w.distanceKm ? `${w.distanceKm} km` : "—"}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </Link>
  );
}
