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

  return NextResponse.redirect(`${origin}/fitness?strava=connected`);
}
