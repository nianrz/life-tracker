"use client";

import { useTheme } from "@/lib/theme";
import { getIcon } from "@/lib/icons";

const SunIcon = getIcon("sun");
const MoonIcon = getIcon("moon");
const AutoIcon = getIcon("auto");

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { preference, theme, setPreference } = useTheme();

  function cycle() {
    if (preference === "auto") setPreference("light");
    else if (preference === "light") setPreference("dark");
    else setPreference("auto");
  }

  const label = preference === "auto" ? "Auto" : theme === "dark" ? "Dark" : "Light";
  const IconComponent = preference === "auto" ? AutoIcon : theme === "dark" ? MoonIcon : SunIcon;

  return (
    <button
      onClick={cycle}
      title={`Theme: ${label} (click to change)`}
      className="flex items-center gap-2 rounded-[var(--radius)] border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-1)] transition-colors"
    >
      <IconComponent size={16} />
      {!compact && <span>{label}</span>}
    </button>
  );
}
