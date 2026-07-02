"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { CalendarEvent } from "@/lib/types/core";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatUpcomingDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const MODULE_COLOR: Record<string, string> = {
  fitness: "var(--module-fitness-text)",
  student: "var(--module-student-text)",
  finance: "var(--module-finance-text)",
};

const MODULE_BG: Record<string, string> = {
  fitness: "var(--module-fitness-bg)",
  student: "var(--module-student-bg)",
  finance: "var(--module-finance-bg)",
};

export function WeekCalendar({ events }: { events: CalendarEvent[] }) {
  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();
  const todayIso = isoDate(today);

  const base = startOfWeek(today);
  base.setDate(base.getDate() + weekOffset * 7);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    return d;
  });

  // Deduplicate events by title+date so a workout that also appears as a
  // FitnessEvent doesn't show twice on the same day.
  const seen = new Set<string>();
  const dedupedEvents = events.filter((ev) => {
    const key = `${ev.date}:${ev.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const eventsByDate = dedupedEvents.reduce<Record<string, CalendarEvent[]>>((acc, ev) => {
    (acc[ev.date] ??= []).push(ev);
    return acc;
  }, {});

  // All upcoming events strictly after today, for the section below the grid.
  const upcomingEvents = dedupedEvents
    .filter((ev) => ev.date > todayIso)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  const weekLabel = (() => {
    const first = days[0];
    const last = days[6];
    if (first.getMonth() === last.getMonth()) {
      return `${first.toLocaleDateString("en-US", { month: "short" })} ${first.getDate()}–${last.getDate()}`;
    }
    return `${first.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${last.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  })();

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-[16px] font-medium">
            {weekOffset === 0 ? "This week" : weekOffset === 1 ? "Next week" : weekOffset === -1 ? "Last week" : "Week of"}
          </h2>
          <p className="text-[12px] text-[var(--text-muted)]">{weekLabel}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            aria-label="Previous week"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            aria-label="Next week"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Day rows: each day is its own row with date label + events inline */}
      <div className="flex flex-col gap-1">
        {days.map((d) => {
          const iso = isoDate(d);
          const isToday = iso === todayIso;
          const isPast = iso < todayIso;
          const dayEvents = eventsByDate[iso] ?? [];

          return (
            <div
              key={iso}
              className={`flex items-start gap-3 rounded-lg px-2 py-1.5 ${
                isToday ? "bg-[var(--bg-accent)]" : ""
              }`}
            >
              {/* Date label */}
              <div className="w-16 shrink-0 flex items-center gap-1.5 pt-0.5">
                <span
                  className={`text-[12px] font-medium w-7 ${
                    isToday
                      ? "text-[var(--text-accent)]"
                      : isPast
                      ? "text-[var(--text-muted)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  {DAY_LABELS[(d.getDay() + 6) % 7]}
                </span>
                <span
                  className={`text-[12px] ${
                    isToday
                      ? "text-[var(--text-accent)] font-semibold"
                      : isPast
                      ? "text-[var(--text-muted)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  {d.getDate()}
                </span>
              </div>

              {/* Events for this day */}
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                {dayEvents.length === 0 ? (
                  <span className="text-[11px] text-[var(--text-muted)] py-0.5">—</span>
                ) : (
                  dayEvents.map((ev) => (
                    <span
                      key={ev.id}
                      className="text-[12px] px-1.5 py-0.5 rounded truncate"
                      style={{
                        color: MODULE_COLOR[ev.module ?? ""] ?? "var(--text-secondary)",
                        background: MODULE_BG[ev.module ?? ""] ?? "transparent",
                      }}
                    >
                      {ev.title}
                    </span>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming: events beyond the current displayed week */}
      {upcomingEvents.some((ev) => !days.some((d) => isoDate(d) === ev.date)) && (
        <div className="mt-3 pt-3 border-t border-[var(--border)]">
          <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-2">
            Upcoming
          </p>
          <div className="flex flex-col gap-2">
            {upcomingEvents
              .filter((ev) => !days.some((d) => isoDate(d) === ev.date))
              .map((ev) => (
                <div key={`up-${ev.id}`} className="flex items-start gap-2">
                  <span
                    className="text-[12px] px-1.5 py-0.5 rounded truncate flex-1"
                    style={{
                      color: MODULE_COLOR[ev.module ?? ""] ?? "var(--text-secondary)",
                      background: MODULE_BG[ev.module ?? ""] ?? "transparent",
                    }}
                  >
                    {ev.title}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] shrink-0 pt-0.5">
                    {formatUpcomingDate(ev.date)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </Card>
  );
}
