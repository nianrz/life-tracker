"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type ThemeMode = "light" | "dark";
export type ThemePreference = "auto" | "light" | "dark";

interface ThemeContextValue {
  theme: ThemeMode; // the resolved theme actually applied
  preference: ThemePreference; // what the user has chosen
  setPreference: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "theme-preference";

/** Dark from 6pm to 6am, light otherwise. Tweak as desired. */
function getTimeBasedTheme(): ThemeMode {
  const hour = new Date().getHours();
  return hour >= 18 || hour < 6 ? "dark" : "light";
}

function resolveTheme(pref: ThemePreference): ThemeMode {
  if (pref === "auto") return getTimeBasedTheme();
  return pref;
}

function readStoredPreference(): ThemePreference {
  if (typeof window === "undefined") return "auto";
  const saved = window.localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
  return saved ?? "auto";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Lazy-init directly from localStorage/time so there's no extra render
  // pass just to "load" the preference -- avoids setState-in-effect churn.
  const [preference, setPreferenceState] = useState<ThemePreference>(readStoredPreference);
  const [theme, setTheme] = useState<ThemeMode>(() => resolveTheme(readStoredPreference()));

  // Re-check time-based theme every 15 minutes while in "auto" mode,
  // so the app actually flips around 6am/6pm if left open.
  useEffect(() => {
    if (preference !== "auto") return;
    const interval = setInterval(() => {
      setTheme(getTimeBasedTheme());
    }, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [preference]);

  // Apply to <html data-theme="...">
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    localStorage.setItem(STORAGE_KEY, pref);
    setTheme(resolveTheme(pref));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
