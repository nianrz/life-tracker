import { createClient } from "@/lib/db/supabase";
import type { ActivityLoad } from "@/lib/fitness/model";
import type { PlanDay } from "@/lib/fitness/suggest";

export interface StravaConnection {
  athleteId: number;
  athleteName: string;
  connectedAt: string;
}

export interface StravaActivityRow {
  id: number;
  name: string;
  sportType: string;
  localDate: string;
  distanceM: number;
  movingTimeS: number;
  elevGainM: number;
  avgHr: number | null;
  sufferScore: number | null;
}

export interface FitnessProfile {
  vo2max: number | null;
  vo2maxUpdatedAt: string | null;
  weekTemplate: PlanDay[];
}

export const stravaRepo = {
  async getConnection(): Promise<StravaConnection | null> {
    const supabase = createClient();
    const { data } = await supabase.from("strava_connections").select("*").maybeSingle();
    if (!data) return null;
    return {
      athleteId: data.athlete_id,
      athleteName: data.athlete_name,
      connectedAt: data.connected_at,
    };
  },

  async disconnect(): Promise<void> {
    const supabase = createClient();
    await supabase.from("strava_connections").delete().neq("athlete_id", 0);
  },

  async listActivities(limit = 30): Promise<StravaActivityRow[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("strava_activities")
      .select("*")
      .order("local_date", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      sportType: r.sport_type,
      localDate: r.local_date,
      distanceM: Number(r.distance_m),
      movingTimeS: r.moving_time_s,
      elevGainM: Number(r.elev_gain_m),
      avgHr: r.avg_hr != null ? Number(r.avg_hr) : null,
      sufferScore: r.suffer_score != null ? Number(r.suffer_score) : null,
    }));
  },

  async listActivityLoads(): Promise<ActivityLoad[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("strava_activities")
      .select("local_date, suffer_score, moving_time_s, avg_hr");
    if (error) throw error;
    return (data ?? []).map((r) => ({
      localDate: r.local_date,
      sufferScore: r.suffer_score != null ? Number(r.suffer_score) : null,
      movingTimeS: r.moving_time_s,
      avgHr: r.avg_hr != null ? Number(r.avg_hr) : null,
    }));
  },

  async getProfile(): Promise<FitnessProfile> {
    const supabase = createClient();
    const { data } = await supabase.from("fitness_profile").select("*").maybeSingle();
    if (!data) return { vo2max: null, vo2maxUpdatedAt: null, weekTemplate: [] };
    return {
      vo2max: data.vo2max != null ? Number(data.vo2max) : null,
      vo2maxUpdatedAt: data.vo2max_updated_at,
      weekTemplate: (data.week_template ?? []) as PlanDay[],
    };
  },

  async saveVo2max(vo2max: number): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    await supabase.from("fitness_profile").upsert({
      user_id: user!.id,
      vo2max,
      vo2max_updated_at: localDate,
      updated_at: new Date().toISOString(),
    });
  },

  async saveWeekTemplate(weekTemplate: PlanDay[]): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("fitness_profile").upsert({
      user_id: user!.id,
      week_template: weekTemplate,
      updated_at: new Date().toISOString(),
    });
  },
};
