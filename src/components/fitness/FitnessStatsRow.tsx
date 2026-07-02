"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, Pencil, Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatShortDate } from "@/lib/dates";
import type { FitnessPoint } from "@/lib/fitness/model";
import type { Suggestion } from "@/lib/fitness/suggest";

const INTENSITY_COLOR: Record<Suggestion["intensity"], string> = {
  rest: "var(--text-muted)",
  recovery: "var(--text-accent)",
  easy: "var(--text-accent)",
  moderate: "var(--text-warning)",
  hard: "var(--text-danger)",
};

export function FitnessStatsRow({
  current,
  trend,
  vo2max,
  vo2maxUpdatedAt,
  onSaveVo2max,
  suggestion,
}: {
  current: FitnessPoint | null;
  trend: number;
  vo2max: number | null;
  vo2maxUpdatedAt: string | null;
  onSaveVo2max: (v: number) => void;
  suggestion: Suggestion;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(vo2max?.toString() ?? "");

  function save() {
    const v = Number(draft);
    if (v > 0 && v < 100) {
      onSaveVo2max(v);
      setEditing(false);
    }
  }

  const TrendIcon = trend > 0.5 ? TrendingUp : trend < -0.5 ? TrendingDown : Minus;
  const trendColor =
    trend > 0.5 ? "var(--text-success)" : trend < -0.5 ? "var(--text-danger)" : "var(--text-muted)";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Fitness score */}
      <Card>
        <p className="text-[13px] text-[var(--text-muted)] mb-1">Fitness</p>
        {current ? (
          <>
            <div className="flex items-baseline gap-2">
              <p className="text-[24px] font-medium">{Math.round(current.fitness)}</p>
              <span className="flex items-center gap-0.5 text-[12px]" style={{ color: trendColor }}>
                <TrendIcon size={13} />
                {trend > 0 ? "+" : ""}{trend} / 7d
              </span>
            </div>
            <p className="text-[12px] text-[var(--text-muted)] mt-1">
              Form {current.form > 0 ? "+" : ""}{current.form}
              {current.form < -10 ? " · fatigued" : current.form > 10 ? " · fresh" : ""}
            </p>
          </>
        ) : (
          <p className="text-[13px] text-[var(--text-muted)]">Connect Strava to compute</p>
        )}
      </Card>

      {/* VO2 max (manual) */}
      <Card>
        <div className="flex items-center justify-between mb-1">
          <p className="text-[13px] text-[var(--text-muted)]">VO₂ max</p>
          <button
            onClick={() => { setDraft(vo2max?.toString() ?? ""); setEditing(!editing); }}
            className="text-[var(--text-muted)] hover:text-[var(--text-accent)]"
            aria-label="Edit VO2 max"
          >
            <Pencil size={13} />
          </button>
        </div>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              className="w-20 text-[18px] font-medium bg-[var(--surface-1)] rounded px-2 py-0.5 outline-none"
              autoFocus
            />
            <button
              onClick={save}
              className="text-[12px] text-[var(--text-accent)] font-medium"
            >
              Save
            </button>
          </div>
        ) : (
          <>
            <p className="text-[24px] font-medium">{vo2max ?? "—"}</p>
            <p className="text-[12px] text-[var(--text-muted)] mt-1">
              {vo2maxUpdatedAt
                ? `From your watch · updated ${formatShortDate(vo2maxUpdatedAt)}`
                : "Tap the pencil to enter from your watch"}
            </p>
          </>
        )}
      </Card>

      {/* Today's suggestion */}
      <Card>
        <div className="flex items-center gap-1.5 mb-1">
          <Zap size={13} style={{ color: INTENSITY_COLOR[suggestion.intensity] }} />
          <p className="text-[13px] text-[var(--text-muted)]">Today&apos;s suggestion</p>
        </div>
        <p className="text-[16px] font-medium leading-snug">{suggestion.headline}</p>
        <p className="text-[12px] text-[var(--text-muted)] mt-1 leading-snug">{suggestion.detail}</p>
      </Card>
    </div>
  );
}
