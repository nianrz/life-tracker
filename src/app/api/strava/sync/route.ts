import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db/supabase-server";

interface StravaTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface StravaActivity {
  id: number;
  name: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  average_heartrate?: number;
  max_heartrate?: number;
  suffer_score?: number;
}

async function refreshTokensIfNeeded(tokens: StravaTokens): Promise<StravaTokens | null> {
  const nowSec = Math.floor(Date.now() / 1000);
  // Refresh if expiring within 5 minutes
  if (tokens.expires_at > nowSec + 300) return tokens;

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: tokens.refresh_token,
    }),
  });
  if (!res.ok) return null;
  const fresh = await res.json();
  return {
    access_token: fresh.access_token,
    refresh_token: fresh.refresh_token,
    expires_at: fresh.expires_at,
  };
}

// POST /api/strava/sync — fetch recent activities and cache them.
export async function POST() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Load stored tokens
  const { data: conn } = await supabase
    .from("strava_connections")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!conn) return NextResponse.json({ error: "not_connected" }, { status: 400 });

  // Refresh tokens if needed
  const tokens = await refreshTokensIfNeeded({
    access_token: conn.access_token,
    refresh_token: conn.refresh_token,
    expires_at: conn.expires_at,
  });
  if (!tokens) return NextResponse.json({ error: "token_refresh_failed" }, { status: 502 });

  // Persist refreshed tokens if they changed
  if (tokens.access_token !== conn.access_token) {
    await supabase
      .from("strava_connections")
      .update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expires_at,
      })
      .eq("user_id", user.id);
  }

  // Fetch activities from the last 90 days (enough for the fitness model,
  // which uses a 42-day decay). 200 per page covers heavy training loads.
  const after = Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000);
  const actRes = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=200`,
    { headers: { Authorization: `Bearer ${tokens.access_token}` } }
  );

  if (!actRes.ok) {
    return NextResponse.json(
      { error: "strava_fetch_failed", status: actRes.status },
      { status: 502 }
    );
  }

  const activities: StravaActivity[] = await actRes.json();

  // Upsert into the cache table
  const rows = activities.map((a) => ({
    id: a.id,
    user_id: user.id,
    name: a.name,
    sport_type: a.sport_type,
    start_date: a.start_date,
    local_date: a.start_date_local.slice(0, 10),
    distance_m: a.distance,
    moving_time_s: a.moving_time,
    elapsed_time_s: a.elapsed_time,
    elev_gain_m: a.total_elevation_gain,
    avg_hr: a.average_heartrate ?? null,
    max_hr: a.max_heartrate ?? null,
    suffer_score: a.suffer_score ?? null,
    synced_at: new Date().toISOString(),
  }));

  if (rows.length > 0) {
    const { error: upsertError } = await supabase
      .from("strava_activities")
      .upsert(rows);
    if (upsertError) {
      return NextResponse.json({ error: "db_upsert_failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ synced: rows.length });
}
