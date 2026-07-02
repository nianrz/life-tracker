-- Life tracker schema
-- Run this in Supabase SQL Editor (paste the whole file and hit Run).
-- Safe to re-run: uses CREATE TABLE IF NOT EXISTS and CREATE POLICY IF NOT EXISTS.

-- -----------------------------------------------------------------------
-- WORKOUTS
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workouts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  title        TEXT NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('run','hike','rest','strength','other')),
  distance_km  NUMERIC,
  notes        TEXT NOT NULL DEFAULT '',
  completed    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='workouts' AND policyname='workouts_self'
  ) THEN
    CREATE POLICY workouts_self ON workouts
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- -----------------------------------------------------------------------
-- FITNESS EVENTS (races, hikes, trips -- distinct from routine workouts)
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fitness_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  title        TEXT NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('race','hike','ride','other')),
  distance_km  NUMERIC,
  location     TEXT NOT NULL DEFAULT '',
  notes        TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE fitness_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='fitness_events' AND policyname='fitness_events_self'
  ) THEN
    CREATE POLICY fitness_events_self ON fitness_events
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- -----------------------------------------------------------------------
-- DELIVERABLES
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deliverables (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  course       TEXT NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('project','exam','quiz','paper','other')),
  due_date     DATE NOT NULL,
  weight       NUMERIC,
  grade        NUMERIC,
  done         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='deliverables' AND policyname='deliverables_self'
  ) THEN
    CREATE POLICY deliverables_self ON deliverables
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- -----------------------------------------------------------------------
-- TRANSACTIONS
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  amount       NUMERIC NOT NULL,
  account      TEXT NOT NULL CHECK (account IN ('bank','gcash','cash')),
  category     TEXT NOT NULL,
  note         TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='transactions' AND policyname='transactions_self'
  ) THEN
    CREATE POLICY transactions_self ON transactions
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- -----------------------------------------------------------------------
-- TASKS (manual to-do items; auto tasks are derived at runtime)
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  done         BOOLEAN NOT NULL DEFAULT FALSE,
  due_date     DATE,
  module       TEXT,
  source       TEXT NOT NULL DEFAULT 'manual',
  source_ref   UUID,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='tasks' AND policyname='tasks_self'
  ) THEN
    CREATE POLICY tasks_self ON tasks
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- -----------------------------------------------------------------------
-- Indexes for common query patterns
-- -----------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS workouts_user_date    ON workouts(user_id, date);
CREATE INDEX IF NOT EXISTS fitness_events_user_date ON fitness_events(user_id, date);
CREATE INDEX IF NOT EXISTS deliverables_user_due  ON deliverables(user_id, due_date);
CREATE INDEX IF NOT EXISTS transactions_user_date  ON transactions(user_id, date);
CREATE INDEX IF NOT EXISTS tasks_user_due          ON tasks(user_id, due_date);
