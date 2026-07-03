"use client";

import { useState } from "react";
import { RefreshCw, Link2, Unlink } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/ui/Card";
import { SecondaryButton } from "@/components/ui/Form";
import type { StravaConnection, StravaActivityRow } from "@/lib/db/repositories/strava";
import type { FitnessPoint } from "@/lib/fitness/model";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// Shows both date and time of day, e.g. "Tue, Jul 1, 7:45 PM" -- important
// because a day-only label can't distinguish a morning hike from an
// evening run on the same calendar day.
function formatDateTime(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatPace(distanceM: number, movingTimeS: number): string {
  if (distanceM === 0) return "";
  const paceSecPerKm = movingTimeS / (distanceM / 1000);
  const min = Math.floor(paceSecPerKm / 60);
  const sec = Math.round(paceSecPerKm % 60);
  return `${min}:${String(sec).padStart(2, "0")}/km`;
}

export function StravaSection({
  connection,
  activities,
  series,
  onSynced,
}: {
  connection: StravaConnection | null;
  activities: StravaActivityRow[];
  series: FitnessPoint[];
  onSynced: () => void;
}) {
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  async function sync() {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/strava/sync", { method: "POST" });
      const body = await res.json();
      if (res.ok) {
        setSyncMessage(
          body.synced === 0
            ? "No activities found in the last 90 days"
            : `Synced ${body.synced} activities`
        );
        onSynced();
      } else {
        setSyncMessage(`Sync failed: ${body.error}`);
      }
    } catch {
      setSyncMessage("Sync failed: network error");
    } finally {
      setSyncing(false);
    }
  }

  if (!connection) {
    return (
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-medium mb-1">Connect Strava</h2>
            <p className="text-[13px] text-[var(--text-secondary)]">
              Sync your activities to unlock the fitness score, fatigue-aware daily
              suggestions, and your recent activity feed.
            </p>
          </div>
          <a
            href="/api/strava/connect"
            className="flex items-center gap-2 shrink-0 ml-4 px-4 h-9 rounded-[var(--radius)] bg-[#FC4C02] text-white text-[14px] font-medium hover:opacity-90 transition-opacity"
          >
            <Link2 size={15} />
            Connect
          </a>
        </div>
      </Card>
    );
  }

  const recent = activities[0];
  // Show last 60 days on the chart
  const chartData = series.slice(-60).map((p) => ({
    date: p.date.slice(5), // MM-DD
    fitness: p.fitness,
    fatigue: p.fatigue,
  }));

  const SyncControl = (
    <div className="flex items-center gap-2">
      {syncMessage && (
        <span className="text-[12px] text-[var(--text-muted)]">{syncMessage}</span>
      )}
      <SecondaryButton onClick={sync} disabled={syncing} className="flex items-center gap-1.5">
        <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
        {syncing ? "Syncing…" : "Sync"}
      </SecondaryButton>
    </div>
  );

  return (
    <>
      {/* Recent activity, or an empty state that still exposes the Sync
          control -- previously the Sync button only existed inside this
          card, so it was invisible until at least one activity existed,
          leaving no way to trigger the very first sync. */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[16px] font-medium">Most recent activity</h2>
          {SyncControl}
        </div>
        {recent ? (
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[15px] font-medium">{recent.name}</p>
              <p className="text-[12px] text-[var(--text-muted)]">
                {formatDateTime(recent.startDate)} · {recent.sportType}
              </p>
            </div>
            <div className="flex gap-4 text-[13px] text-[var(--text-secondary)]">
              {recent.distanceM > 0 && <span>{(recent.distanceM / 1000).toFixed(1)} km</span>}
              <span>{formatDuration(recent.movingTimeS)}</span>
              {recent.distanceM > 0 && <span>{formatPace(recent.distanceM, recent.movingTimeS)}</span>}
              {recent.avgHr && <span>{Math.round(recent.avgHr)} bpm</span>}
            </div>
          </div>
        ) : (
          <p className="text-[13px] text-[var(--text-muted)]">
            No activities synced yet. Tap Sync to pull your recent activities from Strava.
          </p>
        )}
      </Card>

      {/* Fitness trend chart */}
      {chartData.length > 7 && (
        <Card>
          <h2 className="text-[16px] font-medium mb-3">Fitness trend · 60 days</h2>
          <div style={{ width: "100%", height: 160 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                  tickLine={false}
                  axisLine={false}
                  interval={13}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="fitness" stroke="#1D9E75" strokeWidth={2} dot={false} name="Fitness" />
                <Line type="monotone" dataKey="fatigue" stroke="#D85A30" strokeWidth={1.5} dot={false} strokeDasharray="4 3" name="Fatigue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-1 text-[11px] text-[var(--text-muted)]">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#1D9E75] inline-block rounded" /> Fitness</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#D85A30] inline-block rounded" /> Fatigue</span>
          </div>
        </Card>
      )}

      {/* Connection footer */}
      <Card className="flex items-center justify-between">
        <p className="text-[12px] text-[var(--text-muted)]">
          Connected to Strava as {connection.athleteName || `athlete ${connection.athleteId}`}
        </p>
        <a
          href="/api/strava/connect"
          className="flex items-center gap-1 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-danger)]"
        >
          <Unlink size={12} />
          Reconnect
        </a>
      </Card>
    </>
  );
}
