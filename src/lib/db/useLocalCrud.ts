"use client";

import { useState, useCallback } from "react";
import { createLocalStore } from "./localStore";

/**
 * Binds a component to an in-memory store, giving back a reactive `items`
 * array plus create/update/remove methods that trigger re-renders. This is
 * the hook every module page uses instead of touching the store directly.
 *
 * Data lives only for the current page session and resets to the seed on
 * a full page reload -- there's no persistence yet (that comes once
 * Supabase is wired in, behind this same list/create/update/remove shape).
 */
export function useLocalCrud<T extends { id: string }>(storageKey: string, seed: T[] = []) {
  const [store] = useState(() => createLocalStore<T>(storageKey, seed));
  const [items, setItems] = useState<T[]>(() => store.list());

  const create = useCallback(
    (item: Omit<T, "id">) => {
      const created = store.create(item);
      setItems(store.list());
      return created;
    },
    [store]
  );

  const update = useCallback(
    (id: string, patch: Partial<T>) => {
      const updated = store.update(id, patch);
      setItems(store.list());
      return updated;
    },
    [store]
  );

  const remove = useCallback(
    (id: string) => {
      store.remove(id);
      setItems(store.list());
    },
    [store]
  );

  return { items, create, update, remove };
}
