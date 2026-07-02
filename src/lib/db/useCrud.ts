"use client";

import { useState, useEffect, useCallback } from "react";

// Shape every repository must implement.
export interface CrudRepo<T extends { id: string }> {
  list(): Promise<T[]>;
  create(item: Omit<T, "id">): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T>;
  remove(id: string): Promise<void>;
}

/**
 * Binds a component to a Supabase-backed repository, giving back a reactive
 * `items` array plus create/update/remove methods that trigger re-renders.
 *
 * Drop-in replacement for useLocalCrud -- same return shape, same call sites.
 * The only difference is `loading` and `error` states are now meaningful.
 */
export function useCrud<T extends { id: string }>(repo: CrudRepo<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Manual reload (e.g. after an external sync). Not used by the initial
  // mount effect, so setState here is fine.
  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await repo.list();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [repo]);

  // Initial load. The async work is defined inside the effect (per
  // react-hooks/set-state-in-effect) with a cancelled flag to avoid
  // setting state after unmount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await repo.list();
        if (!cancelled) {
          setItems(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [repo]);

  const create = useCallback(
    async (item: Omit<T, "id">) => {
      try {
        const created = await repo.create(item);
        setItems((prev) => [...prev, created]);
        return created;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create");
        throw err;
      }
    },
    [repo]
  );

  const update = useCallback(
    async (id: string, patch: Partial<T>) => {
      try {
        const updated = await repo.update(id, patch);
        setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update");
        throw err;
      }
    },
    [repo]
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        await repo.remove(id);
        setItems((prev) => prev.filter((it) => it.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete");
        throw err;
      }
    },
    [repo]
  );

  return { items, loading, error, create, update, remove, reload };
}
