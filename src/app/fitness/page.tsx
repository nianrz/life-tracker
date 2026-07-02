"use client";

import { useState, useMemo } from "react";
import { PersonStanding, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SecondaryButton } from "@/components/ui/Form";
import { RowActions } from "@/components/ui/RowActions";
import { WorkoutForm } from "@/components/fitness/WorkoutForm";
import { EventForm } from "@/components/fitness/EventForm";
import { useCrud } from "@/lib/db/useCrud";
import { workoutsRepo } from "@/lib/db/repositories/workouts";
import { fitnessEventsRepo } from "@/lib/db/repositories/fitnessEvents";
import type { Workout, FitnessEvent } from "@/lib/modules/fitness";

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function FitnessPage() {
  const workouts = useCrud<Workout>(workoutsRepo);
  const events = useCrud<FitnessEvent>(fitnessEventsRepo);

  const [workoutFormOpen, setWorkoutFormOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | undefined>(undefined);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<FitnessEvent | undefined>(undefined);

  const sortedWorkouts = useMemo(
    () => [...workouts.items].sort((a, b) => a.date.localeCompare(b.date)),
    [workouts.items]
  );
  const sortedEvents = useMemo(
    () => [...events.items].sort((a, b) => a.date.localeCompare(b.date)),
    [events.items]
  );
  const totalKm = useMemo(
    () => workouts.items.reduce((sum, w) => sum + (w.distanceKm ?? 0), 0),
    [workouts.items]
  );

  function openNewWorkout() { setEditingWorkout(undefined); setWorkoutFormOpen(true); }
  function openEditWorkout(w: Workout) { setEditingWorkout(w); setWorkoutFormOpen(true); }
  function submitWorkout(data: Omit<Workout, "id">) {
    if (editingWorkout) workouts.update(editingWorkout.id, data);
    else workouts.create(data);
  }

  function openNewEvent() { setEditingEvent(undefined); setEventFormOpen(true); }
  function openEditEvent(ev: FitnessEvent) { setEditingEvent(ev); setEventFormOpen(true); }
  function submitEvent(data: Omit<FitnessEvent, "id">) {
    if (editingEvent) events.update(editingEvent.id, data);
    else events.create(data);
  }

  const loading = workouts.loading || events.loading;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <PersonStanding size={22} className="text-[var(--module-fitness-text)]" />
        <h1 className="text-[22px] font-medium">Fitness</h1>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-[16px] font-medium">Workouts</h2>
            <p className="text-[13px] text-[var(--text-muted)]">{totalKm}km planned this week</p>
          </div>
          <SecondaryButton onClick={openNewWorkout} className="flex items-center gap-1.5">
            <Plus size={14} /> Add
          </SecondaryButton>
        </div>

        {loading ? (
          <p className="text-[13px] text-[var(--text-muted)] py-3">Loading…</p>
        ) : (
          <div className="flex flex-col divide-y divide-[var(--border)]">
            {sortedWorkouts.map((w) => (
              <div key={w.id} className="group flex items-center justify-between py-2.5 text-[14px]">
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={w.completed}
                    onChange={(e) => workouts.update(w.id, { completed: e.target.checked })}
                    className="w-4 h-4 accent-[var(--fill-accent)] shrink-0"
                  />
                  <div className="min-w-0">
                    <p className={w.completed ? "text-[var(--text-muted)] line-through truncate" : "truncate"}>
                      {w.title}
                    </p>
                    <p className="text-[12px] text-[var(--text-muted)]">{formatDate(w.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[var(--text-secondary)] text-[13px]">
                    {w.distanceKm ? `${w.distanceKm} km` : "—"}
                  </span>
                  <RowActions onEdit={() => openEditWorkout(w)} onDelete={() => workouts.remove(w.id)} />
                </div>
              </div>
            ))}
            {sortedWorkouts.length === 0 && (
              <p className="text-[13px] text-[var(--text-muted)] py-3">No workouts yet. Add your first one.</p>
            )}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-medium">Events</h2>
          <SecondaryButton onClick={openNewEvent} className="flex items-center gap-1.5">
            <Plus size={14} /> Add
          </SecondaryButton>
        </div>

        {loading ? (
          <p className="text-[13px] text-[var(--text-muted)] py-3">Loading…</p>
        ) : (
          <div className="flex flex-col divide-y divide-[var(--border)]">
            {sortedEvents.map((ev) => (
              <div key={ev.id} className="group flex items-center justify-between py-2.5 text-[14px]">
                <div className="min-w-0">
                  <p className="truncate">{ev.title}</p>
                  <p className="text-[12px] text-[var(--text-muted)]">
                    {formatDate(ev.date)}{ev.location ? ` · ${ev.location}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[var(--text-secondary)] text-[13px]">
                    {ev.distanceKm ? `${ev.distanceKm} km` : ""}
                  </span>
                  <RowActions onEdit={() => openEditEvent(ev)} onDelete={() => events.remove(ev.id)} />
                </div>
              </div>
            ))}
            {sortedEvents.length === 0 && (
              <p className="text-[13px] text-[var(--text-muted)] py-3">No events yet. Add a race, hike, or trip.</p>
            )}
          </div>
        )}
      </Card>

      <Card className="text-[13px] text-[var(--text-muted)]">
        Garmin / Strava sync coming in a later phase.
      </Card>

      <WorkoutForm
        open={workoutFormOpen}
        onClose={() => setWorkoutFormOpen(false)}
        onSubmit={submitWorkout}
        initial={editingWorkout}
      />
      <EventForm
        open={eventFormOpen}
        onClose={() => setEventFormOpen(false)}
        onSubmit={submitEvent}
        initial={editingEvent}
      />
    </div>
  );
}
