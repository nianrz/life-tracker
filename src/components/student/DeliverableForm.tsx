"use client";

import { useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { Field, TextInput, Select, PrimaryButton, SecondaryButton } from "@/components/ui/Form";
import type { Deliverable, DeliverableType } from "@/lib/modules/student";

const TYPE_OPTIONS: { value: DeliverableType; label: string }[] = [
  { value: "project", label: "Project" },
  { value: "exam", label: "Exam" },
  { value: "quiz", label: "Quiz" },
  { value: "paper", label: "Paper" },
  { value: "other", label: "Other" },
];

export function DeliverableForm({
  open,
  onClose,
  onSubmit,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (deliverable: Omit<Deliverable, "id">) => void;
  initial?: Deliverable;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [course, setCourse] = useState(initial?.course ?? "");
  const [type, setType] = useState<DeliverableType>(initial?.type ?? "project");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? new Date().toISOString().slice(0, 10));
  const [weight, setWeight] = useState(initial?.weight?.toString() ?? "");
  const [grade, setGrade] = useState(initial?.grade?.toString() ?? "");
  const [done, setDone] = useState(initial?.done ?? false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !course.trim()) return;
    onSubmit({
      title: title.trim(),
      course: course.trim(),
      type,
      dueDate,
      weight: weight ? Number(weight) : null,
      grade: grade ? Number(grade) : null,
      done,
    });
    onClose();
  }

  return (
    <Panel open={open} onClose={onClose} title={initial ? "Edit deliverable" : "Add deliverable"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field label="Title">
          <TextInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="OS midterm exam"
            autoFocus
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Course">
            <TextInput value={course} onChange={(e) => setCourse(e.target.value)} placeholder="CSOPESY" />
          </Field>
          <Field label="Type">
            <Select value={type} onChange={(e) => setType(e.target.value as DeliverableType)}>
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Due date">
          <TextInput type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Weight % (optional)">
            <TextInput
              type="number"
              min="0"
              max="100"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="25"
            />
          </Field>
          <Field label="Grade % (once known)">
            <TextInput
              type="number"
              min="0"
              max="100"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="—"
            />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)] mt-1">
          <input
            type="checkbox"
            checked={done}
            onChange={(e) => setDone(e.target.checked)}
            className="w-4 h-4 accent-[var(--fill-accent)]"
          />
          Done
        </label>

        <div className="flex gap-2 mt-2">
          <PrimaryButton type="submit" className="flex-1">
            {initial ? "Save changes" : "Add deliverable"}
          </PrimaryButton>
          <SecondaryButton type="button" onClick={onClose}>
            Cancel
          </SecondaryButton>
        </div>
      </form>
    </Panel>
  );
}
