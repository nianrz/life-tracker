"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { PersonStanding, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SecondaryButton } from "@/components/ui/Form";
import { RowActions } from "@/components/ui/RowActions";
import { WorkoutForm } from "@/components/fitness/WorkoutForm";
import { EventForm } from "@/components/fitness/EventForm";
import { FitnessStatsRow } from "@/components/fitness/FitnessStatsRow";
import { StravaSection } from "@/components/fitness/StravaSection";
import { useCrud } from "@/lib/db/useCrud";
import { workoutsRepo } from "@/lib/db/repositories/workouts";
import { fitnessEventsRepo } from "@/lib/db/repositories/fitnessEvents";
import {
  stravaRepo,
  type StravaConnection,
  type StravaActivityRow,
  type FitnessProfile,
} from "@/lib/db/repositories/strava";
import { computeFitnessSeries, currentFitness, fitnessTrend } from "@/lib/fitness/model";
import { suggestToday, DEFAULT_WEEK_TEMPLATE } from "@/lib/fitness/suggest";
import { formatDate } from "@/lib/dates";
import type { Workout, FitnessEvent } from "@/lib/modules/fitness";

export default function FitnessPage() {
  const workouts = useCrud<Workout>(workoutsRepo);
  const events = useCrud<FitnessEvent>(fitnessEventsRepo);

  const [workoutFormOpen, setWorkoutFormOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | undefined>(undefined);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<FitnessEvent | undefined>(undefined);

  // Strava state
  const [connection, setConnection] = useState<StravaConnection | null>(null);
  const [activities, setActivities] = useState<StravaActivityRow[]>([]);
  const [profile, setProfile] = useState<FitnessProfile>({
    vo2max: null,
    vo2maxUpdatedAt: null,
    weekTemplate: [],
  });
  const [series, setSeries] = useState<ReturnType<typeof computeFitnessSeries>>([]);

  const loadStrava = useCallback(async () => {
    const [conn, acts, prof, loads] = await Promise.all([
      stravaRepo.getConnection(),
      stravaRepo.listActivities(10),
      stravaRepo.getProfile(),
      stravaRepo.listActivityLoads(),
    ]);
    setConnection(conn);
    setActivities(acts);
    setProfile(prof);
    setSeries(computeFitnessSeries(loads));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [conn, acts, prof, loads] = await Promise.all([
        stravaRepo.getConnection(),
        stravaRepo.listActivities(10),
        stravaRepo.getProfile(),
        stravaRepo.listActivityLoads(),
      ]);
      if (cancelled) return;
      setConnection(conn);
      setActivities(acts);
      setProfile(prof);
      setSeries(computeFitnessSeries(loads));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const current = currentFitness(series);
  const trend = fitnessTrend(series, 7);

  const suggestion = useMemo(() => {
    const template = profile.weekTemplate.length === 7 ? profile.weekTemplate : DEFAULT_WEEK_TEMPLATE;
    const dayOfWeek = (new Date().getDay() + 6) % 7; // Monday = 0
    return suggestToday(template, current, dayOfWeek);
  }, [profile.weekTemplate, current]);

  async function saveVo2max(v: number) {
    await stravaRepo.saveVo2max(v);
    setProfile((p) => ({ ...p, vo2max: v, vo2maxUpdatedAt: new Date().toISOString().slice(0, 10) }));
  }

  const sortedWorkouts = useMemo(
    () => [...workouts.items].sort((a, b) => a.date.localeCompare(b.date)),
    [workouts.items]
  );
  const sortedEvents = useMemo(
    () => [...events.items].sort((a, b) => a.date.localeCompare(b.date)),
    [events.items]
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <PersonStanding size={22} className="text-[var(--module-fitness-text)]" />
        <h1 className="text-[22px] font-medium">Fitness</h1>
      </div>

      {/* Stats: Fitness score, VO2 max, Today's suggestion */}
      <FitnessStatsRow
        current={current}
        trend={trend}
        vo2max={profile.vo2max}
        vo2maxUpdatedAt={profile.vo2maxUpdatedAt}
        onSaveVo2max={saveVo2max}
        suggestion={suggestion}
      />

      {/* Strava: connect card OR recent activity + fitness chart */}
      <StravaSection
        connection={connection}
        activities={activities}
        series={series}
        onSynced={loadStrava}
      />

      {/* Planned workouts */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-medium">Planned workouts</h2>
          <SecondaryButton onClick={openNewWorkout} className="flex items-center gap-1.5">
            <Plus size={14} /> Add
          </SecondaryButton>
        </div>

        {workouts.loading ? (
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

      {/* Events */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-medium">Events</h2>
          <SecondaryButton onClick={openNewEvent} className="flex items-center gap-1.5">
            <Plus size={14} /> Add
          </SecondaryButton>
        </div>

        {events.loading ? (
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
