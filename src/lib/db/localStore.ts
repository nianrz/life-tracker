"use client";

// An in-memory persistence layer. Every module's repository (fitness
// workouts, student deliverables, finance transactions) is built on top of
// this same generic CRUD shape.
//
// Deliberately NOT backed by localStorage: data here lives only for the
// current browser session/page load, and resets to the seed on refresh.
// This keeps the CRUD-interaction phase of the build simple and avoids
// stale local data lingering once real persistence (Supabase) is wired in.
//
// When Supabase is wired in later, each module's repository swaps its
// internal implementation to call Supabase instead -- the function
// signatures (list/create/update/remove) stay the same, so no component
// code needs to change.

// Module-level map so each storageKey gets its own in-memory array that
// survives across component remounts within the same page session (e.g.
// navigating away and back), but resets on a full page reload.
const memoryStores = new Map<string, unknown[]>();

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Creates a simple CRUD store for a given key, seeded with initial data
 * the first time it's accessed (so the app has something to show before
 * the user adds their own data).
 */
export function createLocalStore<T extends { id: string }>(
  storageKey: string,
  seed: T[] = []
) {
  function ensureSeeded(): T[] {
    if (!memoryStores.has(storageKey)) {
      memoryStores.set(storageKey, [...seed]);
    }
    return memoryStores.get(storageKey) as T[];
  }

  return {
    list(): T[] {
      return ensureSeeded();
    },
    create(item: Omit<T, "id">): T {
      const items = ensureSeeded();
      const newItem = { ...item, id: generateId() } as T;
      memoryStores.set(storageKey, [...items, newItem]);
      return newItem;
    },
    update(id: string, patch: Partial<T>): T | null {
      const items = ensureSeeded();
      let updated: T | null = null;
      const next = items.map((it) => {
        if (it.id === id) {
          updated = { ...it, ...patch };
          return updated;
        }
        return it;
      });
      memoryStores.set(storageKey, next);
      return updated;
    },
    remove(id: string): void {
      const items = ensureSeeded();
      memoryStores.set(storageKey, items.filter((it) => it.id !== id));
    },
    /** Escape hatch for resetting back to seed data, used in dev/testing. */
    reset(): void {
      memoryStores.set(storageKey, [...seed]);
    },
  };
}
