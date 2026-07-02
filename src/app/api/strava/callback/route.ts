import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db/supabase-server";

// Strava redirects here after the user authorizes. Exchange the code for
// access + refresh tokens and store them in strava_connections.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${origin}/fitness?strava=denied`);
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  // Exchange authorization code for tokens
  const tokenRes = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${origin}/fitness?strava=error`);
  }

  const tokens = await tokenRes.json();
  // tokens: { access_token, refresh_token, expires_at, athlete: {...} }

  const { error: dbError } = await supabase.from("strava_connections").upsert({
    user_id: user.id,
    athlete_id: tokens.athlete.id,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: tokens.expires_at,
    athlete_name: `${tokens.athlete.firstname ?? ""} ${tokens.athlete.lastname ?? ""}`.trim(),
  });

  if (dbError) {
    return NextResponse.redirect(`${origin}/fitness?strava=error`);
  }

  // Immediately pull recent activities so the user doesn't land on an
  // empty Fitness page after connecting -- best effort, connection still
  // succeeds even if this fails (they can hit Sync manually).
  try {
    const after = Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000);
    const actRes = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=200`,
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );
    if (actRes.ok) {
      const activities = await actRes.json();
      const rows = activities.map((a: {
        id: number; name: string; sport_type: string; start_date: string;
        start_date_local: string; distance: number; moving_time: number;
        elapsed_time: number; total_elevation_gain: number;
        average_heartrate?: number; max_heartrate?: number; suffer_score?: number;
      }) => ({
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
        await supabase.from("strava_activities").upsert(rows);
      }
    }
  } catch {
    // Non-fatal -- the Fitness page always shows a visible Sync button
    // as a fallback if this initial pull didn't happen.
  }

  return NextResponse.redirect(`${origin}/fitness?strava=connected`);
}
