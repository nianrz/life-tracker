/**
 * Timezone-safe date utilities.
 *
 * The core rule: never use `date.toISOString()` to get a YYYY-MM-DD string —
 * it outputs UTC midnight, which shifts the date backward for UTC+ timezones
 * (e.g. UTC+8 Philippines: 2026-07-02T00:00:00+08:00 becomes 2026-07-01 in UTC).
 *
 * Instead, always format using local year/month/day parts.
 */

/** Returns today's date as a local YYYY-MM-DD string. */
export function todayIso(): string {
  return localIso(new Date());
}

/** Converts any Date to a local YYYY-MM-DD string (no UTC shift). */
export function localIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parses a YYYY-MM-DD string as a local date (not UTC midnight). */
export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Formats a YYYY-MM-DD string for display, e.g. "Thu, Jul 2". */
export function formatDate(iso: string, options?: Intl.DateTimeFormatOptions): string {
  return parseLocalDate(iso).toLocaleDateString("en-US", options ?? {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** Formats a YYYY-MM-DD string as short month+day, e.g. "Jul 2". */
export function formatShortDate(iso: string): string {
  return parseLocalDate(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** Returns true if the ISO date is in the current calendar month. */
export function isThisMonth(iso: string): boolean {
  const now = new Date();
  const d = parseLocalDate(iso);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

/** Adds N days to a YYYY-MM-DD string, returns a new YYYY-MM-DD string. */
export function addDays(iso: string, days: number): string {
  const d = parseLocalDate(iso);
  d.setDate(d.getDate() + days);
  return localIso(d);
}
