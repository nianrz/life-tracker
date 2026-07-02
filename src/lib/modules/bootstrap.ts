import { registerModule } from "@/lib/modules/registry";
import { fitnessModule } from "@/lib/modules/fitness";
import { studentModule } from "@/lib/modules/student";
import { financeModule } from "@/lib/modules/finance";

// To add a new module in the future:
//   1. Build it under lib/modules/<name>/index.ts (export a ModuleDefinition)
//   2. Build its page under app/<name>/page.tsx
//   3. Import + register it here
let registered = false;

export function ensureModulesRegistered() {
  if (registered) return;
  registerModule(fitnessModule);
  registerModule(studentModule);
  registerModule(financeModule);
  registered = true;
}
