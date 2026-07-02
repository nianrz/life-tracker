"use client";

import { useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { Field, TextInput, Select, PrimaryButton, SecondaryButton } from "@/components/ui/Form";
import type { Workout, WorkoutType } from "@/lib/modules/fitness";

const TYPE_OPTIONS: { value: WorkoutType; label: string }[] = [
  { value: "run", label: "Run" },
  { value: "hike", label: "Hike" },
  { value: "strength", label: "Strength" },
  { value: "rest", label: "Rest" },
  { value: "other", label: "Other" },
];

export function WorkoutForm({
  open,
  onClose,
  onSubmit,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (workout: Omit<Workout, "id">) => void;
  initial?: Workout;
}) {
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState(initial?.title ?? "");
  const [type, setType] = useState<WorkoutType>(initial?.type ?? "run");
  const [distanceKm, setDistanceKm] = useState(initial?.distanceKm?.toString() ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [completed, setCompleted] = useState(initial?.completed ?? false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      date,
      title: title.trim(),
      type,
      distanceKm: distanceKm ? Number(distanceKm) : null,
      notes: notes.trim(),
      completed,
    });
    onClose();
  }

  return (
    <Panel open={open} onClose={onClose} title={initial ? "Edit workout" : "Add workout"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field label="Title">
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Easy run" autoFocus />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Type">
            <Select value={type} onChange={(e) => setType(e.target.value as WorkoutType)}>
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Distance (km, optional)">
          <TextInput
            type="number"
            step="0.1"
            min="0"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            placeholder="6"
          />
        </Field>
        <Field label="Notes (optional)">
          <TextInput value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Pacing, route, gear..." />
        </Field>
        <label className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)] mt-1">
          <input
            type="checkbox"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
            className="w-4 h-4 accent-[var(--fill-accent)]"
          />
          Completed
        </label>

        <div className="flex gap-2 mt-2">
          <PrimaryButton type="submit" className="flex-1">
            {initial ? "Save changes" : "Add workout"}
          </PrimaryButton>
          <SecondaryButton type="button" onClick={onClose}>
            Cancel
          </SecondaryButton>
        </div>
      </form>
    </Panel>
  );
}
