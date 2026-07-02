"use client";

import { useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { Field, TextInput, Select, PrimaryButton, SecondaryButton } from "@/components/ui/Form";
import type { FitnessEvent, EventType } from "@/lib/modules/fitness";

const TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: "race", label: "Race" },
  { value: "hike", label: "Hike" },
  { value: "ride", label: "Ride" },
  { value: "other", label: "Other" },
];

export function EventForm({
  open,
  onClose,
  onSubmit,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: Omit<FitnessEvent, "id">) => void;
  initial?: FitnessEvent;
}) {
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState(initial?.title ?? "");
  const [type, setType] = useState<EventType>(initial?.type ?? "race");
  const [distanceKm, setDistanceKm] = useState(initial?.distanceKm?.toString() ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      date,
      title: title.trim(),
      type,
      distanceKm: distanceKm ? Number(distanceKm) : null,
      location: location.trim(),
      notes: notes.trim(),
    });
    onClose();
  }

  return (
    <Panel open={open} onClose={onClose} title={initial ? "Edit event" : "Add event"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field label="Title">
          <TextInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Mt. Ugo hike"
            autoFocus
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Type">
            <Select value={type} onChange={(e) => setType(e.target.value as EventType)}>
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Distance (km, optional)">
            <TextInput
              type="number"
              step="0.1"
              min="0"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              placeholder="24"
            />
          </Field>
          <Field label="Location (optional)">
            <TextInput value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Benguet" />
          </Field>
        </div>
        <Field label="Notes (optional)">
          <TextInput value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Gear, logistics, group..." />
        </Field>

        <div className="flex gap-2 mt-2">
          <PrimaryButton type="submit" className="flex-1">
            {initial ? "Save changes" : "Add event"}
          </PrimaryButton>
          <SecondaryButton type="button" onClick={onClose}>
            Cancel
          </SecondaryButton>
        </div>
      </form>
    </Panel>
  );
}
