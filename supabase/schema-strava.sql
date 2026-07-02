-- Life tracker: Strava integration schema additions
-- Run this in Supabase SQL Editor after the base schema.

-- -----------------------------------------------------------------------
-- STRAVA CONNECTIONS: one row per user holding OAuth tokens
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS strava_connections (
  user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  athlete_id    BIGINT NOT NULL,
  access_token  TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at    BIGINT NOT NULL,          -- unix timestamp
  athlete_name  TEXT NOT NULL DEFAULT '',
  connected_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE strava_connections ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='strava_connections' AND policyname='strava_connections_self'
  ) THEN
    CREATE POLICY strava_connections_self ON strava_connections
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- -----------------------------------------------------------------------
-- STRAVA ACTIVITIES: cached copy of synced activities
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS strava_activities (
  id             BIGINT PRIMARY KEY,       -- Strava's activity id
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  sport_type     TEXT NOT NULL,
  start_date     TIMESTAMPTZ NOT NULL,
  local_date     DATE NOT NULL,            -- start date in athlete's local tz
  distance_m     NUMERIC NOT NULL DEFAULT 0,
  moving_time_s  INTEGER NOT NULL DEFAULT 0,
  elapsed_time_s INTEGER NOT NULL DEFAULT 0,
  elev_gain_m    NUMERIC NOT NULL DEFAULT 0,
  avg_hr         NUMERIC,
  max_hr         NUMERIC,
  suffer_score   NUMERIC,                  -- Strava Relative Effort
  synced_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE strava_activities ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='strava_activities' AND policyname='strava_activities_self'
  ) THEN
    CREATE POLICY strava_activities_self ON strava_activities
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS strava_activities_user_date ON strava_activities(user_id, local_date DESC);

-- -----------------------------------------------------------------------
-- FITNESS PROFILE: manual VO2 max + weekly plan template
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fitness_profile (
  user_id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  vo2max            NUMERIC,
  vo2max_updated_at DATE,
  -- Weekly plan template: JSON array of 7 entries (Mon..Sun), each like
  -- { "type": "easy" | "quality" | "long" | "rest", "label": "Easy run", "distanceKm": 6 }
  week_template     JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE fitness_profile ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='fitness_profile' AND policyname='fitness_profile_self'
  ) THEN
    CREATE POLICY fitness_profile_self ON fitness_profile
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;
