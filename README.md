# Life tracker

A personal life tracker: fitness, school, and finances in one dashboard.
Built with Next.js, TypeScript, Tailwind CSS, and (soon) Supabase.

## Status

**Phase 2 complete: full CRUD on mock/in-memory data.** What's working:

- Dashboard with a live, derived to-do list (today's workout + deliverables
  due today, pulled automatically from the module data, plus manually
  added ad-hoc tasks you can check off or remove)
- Week calendar with event dots, sourced from real fitness events,
  workouts, and deliverable due dates
- **Fitness**: separate "Add workout" and "Add event" flows (workouts =
  the weekly grind: runs, rest days, strength; events = one-off races,
  hikes, trips), full edit/delete, mark-complete checkboxes
- **Student**: add/edit/delete deliverables with course, type, due date,
  weight, and grade; a live weighted-average calculation across graded
  items
- **Finance**: add/edit/delete transactions across bank/GCash/cash,
  category as a dropdown of common categories with an "Other" option to
  type a new one (which then shows up in the dropdown going forward),
  account balance cards, income/expense/net summary, and an expenses-by-
  category pie chart
- Responsive layout: sidebar nav on desktop, bottom tab bar on mobile
- Light/dark theme that auto-switches by time of day (6pm-6am = dark),
  with a manual override (click the theme button in the sidebar -- it
  cycles Auto -> Light -> Dark)
- Modular architecture: each module lives in `src/lib/modules/<name>/`
  and registers itself in `src/lib/modules/bootstrap.ts`. Adding a new
  module later doesn't require touching the dashboard or nav code.

### Important: data is in-memory only right now

All CRUD changes (adding a workout, logging a transaction, etc.) live in
memory for the current page session only. **Refreshing the page resets
everything back to the seed/sample data.** This is intentional for this
build phase -- it lets the CRUD interactions themselves get tested and
refined before real persistence is added.

The storage layer (`src/lib/db/localStore.ts` + `useLocalCrud.ts`) is
already shaped like a tiny repository pattern (`list/create/update/remove`)
specifically so that swapping the in-memory Map for real Supabase calls
later won't require changing any component code.

## Project structure

```
src/
  app/                  Next.js pages (dashboard, fitness, student, finance)
  components/
    ui/                 Shared primitives (Card, Panel, Form fields, RowActions)
    layout/             Sidebar, bottom tab bar, theme toggle
    dashboard/          Dashboard widgets (to-do list, week calendar, module summary cards)
    fitness/            WorkoutForm, EventForm
    student/            DeliverableForm
    finance/            TransactionForm
  lib/
    modules/            One folder per module, each exporting a ModuleDefinition + types + seed data
      registry.ts       The module registry pattern
      bootstrap.ts      Where modules get registered -- add new ones here
    db/
      localStore.ts     Generic in-memory CRUD store (list/create/update/remove)
      useLocalCrud.ts   React hook binding a component to a store
    types/core.ts        Shared types (Task, CalendarEvent, ModuleDefinition)
    theme.tsx            Light/dark theme provider (time-based + manual override)
    icons.ts             Icon name -> component mapping
```

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Adding a new module later

1. Create `src/lib/modules/<name>/index.ts` exporting a `ModuleDefinition`
   (see `src/lib/modules/fitness/index.ts` for a template).
2. Create `src/app/<name>/page.tsx` for the module's own page.
3. Register it in `src/lib/modules/bootstrap.ts`.

That's it -- the dashboard, sidebar, and bottom tab bar all read from the
module registry automatically.

## Deployment (once you're ready)

This app is designed to deploy for free on **Vercel** with a **Supabase**
database. See the setup guide (will be provided once the database layer
is built) for step-by-step instructions.
