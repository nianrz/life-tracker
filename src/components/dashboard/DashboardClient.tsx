"use client";

import { useMemo } from "react";
import { TodoList } from "@/components/dashboard/TodoList";
import { WeekCalendar } from "@/components/dashboard/WeekCalendar";
import { ModuleSummaryGrid } from "@/components/dashboard/ModuleSummaryGrid";
import { useCrud } from "@/lib/db/useCrud";
import { workoutsRepo } from "@/lib/db/repositories/workouts";
import { fitnessEventsRepo } from "@/lib/db/repositories/fitnessEvents";
import { deliverablesRepo } from "@/lib/db/repositories/deliverables";
import { tasksRepo } from "@/lib/db/repositories/tasks";
import type { Task, CalendarEvent } from "@/lib/types/core";
import { todayIso } from "@/lib/dates";
import type { Workout, FitnessEvent } from "@/lib/modules/fitness";
import type { Deliverable } from "@/lib/modules/student";


export function DashboardClient() {
  const workouts = useCrud<Workout>(workoutsRepo);
  const events = useCrud<FitnessEvent>(fitnessEventsRepo);
  const deliverables = useCrud<Deliverable>(deliverablesRepo);
  const manualTasks = useCrud<Task>(tasksRepo);

  const today = todayIso();

  const autoTasks = useMemo<Task[]>(() => {
    const list: Task[] = [];

    const todaysWorkout = workouts.items.find((w) => w.date === today && w.type !== "rest");
    if (todaysWorkout) {
      list.push({
        id: `auto-fitness-${todaysWorkout.id}`,
        userId: "",
        title: `${todaysWorkout.title}${todaysWorkout.distanceKm ? ` · ${todaysWorkout.distanceKm}km` : ""}`,
        done: todaysWorkout.completed,
        dueDate: todaysWorkout.date,
        module: "fitness",
        source: "auto",
        sourceRef: todaysWorkout.id,
        createdAt: "",
      });
    }

    deliverables.items
      .filter((d) => d.dueDate === today)
      .forEach((d) => {
        list.push({
          id: `auto-student-${d.id}`,
          userId: "",
          title: d.title,
          done: d.done,
          dueDate: d.dueDate,
          module: "student",
          source: "auto",
          sourceRef: d.id,
          createdAt: "",
        });
      });

    return list;
  }, [workouts.items, deliverables.items, today]);

  function handleToggleAuto(task: Task) {
    if (task.module === "fitness" && task.sourceRef) {
      workouts.update(task.sourceRef, { completed: !task.done });
    } else if (task.module === "student" && task.sourceRef) {
      deliverables.update(task.sourceRef, { done: !task.done });
    }
  }

  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    const fromEvents: CalendarEvent[] = events.items.map((ev) => ({
      id: ev.id,
      userId: "",
      title: ev.title,
      module: "fitness",
      type: ev.type,
      date: ev.date,
      time: null,
      details: {},
      createdAt: "",
    }));

    const fromWorkouts: CalendarEvent[] = workouts.items
      .filter((w) => w.type !== "rest")
      .map((w) => ({
        id: `workout-${w.id}`,
        userId: "",
        title: w.title,
        module: "fitness",
        type: w.type,
        date: w.date,
        time: null,
        details: {},
        createdAt: "",
      }));

    const fromDeliverables: CalendarEvent[] = deliverables.items.map((d) => ({
      id: `deliverable-${d.id}`,
      userId: "",
      title: d.title,
      module: "student",
      type: d.type,
      date: d.dueDate,
      time: null,
      details: {},
      createdAt: "",
    }));

    return [...fromEvents, ...fromWorkouts, ...fromDeliverables];
  }, [events.items, workouts.items, deliverables.items]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4">
        <TodoList
          autoTasks={autoTasks}
          manualTasks={manualTasks.items}
          onToggleAuto={handleToggleAuto}
          onToggleManual={(id, done) => manualTasks.update(id, { done })}
          onAddManual={(title) =>
            manualTasks.create({
              userId: "",
              title,
              done: false,
              dueDate: today,
              module: null,
              source: "manual",
              sourceRef: null,
              createdAt: new Date().toISOString(),
            } as Omit<Task, "id">)
          }
          onRemoveManual={(id) => manualTasks.remove(id)}
        />
        <WeekCalendar events={calendarEvents} />
      </div>

      <ModuleSummaryGrid />
    </>
  );
}
