import type { ModuleDefinition } from "@/lib/types/core";

/**
 * The module registry. Every module defined under lib/modules/<name>/index.ts
 * registers itself here. The dashboard, sidebar nav, and bottom tab bar all
 * read from this list -- so adding a new module later means:
 *
 *   1. Create lib/modules/<name>/index.ts exporting a ModuleDefinition
 *   2. Create app/<name>/page.tsx for the module's own page
 *   3. Add one line below to register it
 *
 * No other file needs to change.
 */
const registry: ModuleDefinition[] = [];

export function registerModule(def: ModuleDefinition) {
  registry.push(def);
}

export function getModules(): ModuleDefinition[] {
  return registry;
}

export function getModule(id: string): ModuleDefinition | undefined {
  return registry.find((m) => m.id === id);
}
