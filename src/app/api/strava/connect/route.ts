import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/db/supabase-server";

// Starts the Strava OAuth flow. Requires the user to be logged in.
export async function GET(request: Request) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { origin } = new URL(request.url);
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    redirect_uri: `${origin}/api/strava/callback`,
    response_type: "code",
    approval_prompt: "auto",
    scope: "read,activity:read_all", // read_all includes private activities
  });

  return NextResponse.redirect(`https://www.strava.com/oauth/authorize?${params}`);
}
