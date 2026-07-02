"use client";

import { useState, useMemo } from "react";
import { GraduationCap, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SecondaryButton } from "@/components/ui/Form";
import { RowActions } from "@/components/ui/RowActions";
import { DeliverableForm } from "@/components/student/DeliverableForm";
import { useCrud } from "@/lib/db/useCrud";
import { deliverablesRepo } from "@/lib/db/repositories/deliverables";
import type { Deliverable } from "@/lib/modules/student";

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function StudentPage() {
  const deliverables = useCrud<Deliverable>(deliverablesRepo);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Deliverable | undefined>(undefined);

  const todayIso = new Date().toISOString().slice(0, 10);

  const sorted = useMemo(
    () => [...deliverables.items].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [deliverables.items]
  );

  const gradedWeighted = deliverables.items.filter((d) => d.grade !== null && d.weight !== null);
  const totalWeight = gradedWeighted.reduce((s, d) => s + (d.weight ?? 0), 0);
  const weightedAvg =
    totalWeight > 0
      ? gradedWeighted.reduce((s, d) => s + (d.grade ?? 0) * (d.weight ?? 0), 0) / totalWeight
      : null;

  function openNew() { setEditing(undefined); setFormOpen(true); }
  function openEdit(d: Deliverable) { setEditing(d); setFormOpen(true); }
  function submit(data: Omit<Deliverable, "id">) {
    if (editing) deliverables.update(editing.id, data);
    else deliverables.create(data);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <GraduationCap size={22} className="text-[var(--module-student-text)]" />
        <h1 className="text-[22px] font-medium">Student</h1>
      </div>

      {weightedAvg !== null && (
        <Card>
          <p className="text-[13px] text-[var(--text-muted)] mb-1">Weighted average (graded items)</p>
          <p className="text-[24px] font-medium">{weightedAvg.toFixed(1)}%</p>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-medium">Deliverables</h2>
          <SecondaryButton onClick={openNew} className="flex items-center gap-1.5">
            <Plus size={14} /> Add
          </SecondaryButton>
        </div>

        {deliverables.loading ? (
          <p className="text-[13px] text-[var(--text-muted)] py-3">Loading…</p>
        ) : (
          <div className="flex flex-col divide-y divide-[var(--border)]">
            {sorted.map((d) => {
              const overdue = !d.done && d.dueDate < todayIso;
              return (
                <div key={d.id} className="group flex items-center justify-between py-2.5 text-[14px]">
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={d.done}
                      onChange={(e) => deliverables.update(d.id, { done: e.target.checked })}
                      className="w-4 h-4 accent-[var(--fill-accent)] shrink-0"
                    />
                    <div className="min-w-0">
                      <p className={d.done ? "text-[var(--text-muted)] line-through truncate" : "truncate"}>
                        {d.title}
                      </p>
                      <p className="text-[12px] text-[var(--text-muted)]">
                        {d.course}{d.weight ? ` · ${d.weight}% of grade` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {d.grade !== null && (
                      <span className="text-[13px] text-[var(--text-accent)]">{d.grade}%</span>
                    )}
                    <span className={`text-[13px] ${overdue ? "text-[var(--text-danger)]" : "text-[var(--text-secondary)]"}`}>
                      {formatDate(d.dueDate)}
                    </span>
                    <RowActions onEdit={() => openEdit(d)} onDelete={() => deliverables.remove(d.id)} />
                  </div>
                </div>
              );
            })}
            {sorted.length === 0 && (
              <p className="text-[13px] text-[var(--text-muted)] py-3">No deliverables yet. Add a deadline or exam.</p>
            )}
          </div>
        )}
      </Card>

      <Card className="text-[13px] text-[var(--text-muted)]">
        Canvas API sync coming in a later phase.
      </Card>

      <DeliverableForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={submit}
        initial={editing}
      />
    </div>
  );
}
