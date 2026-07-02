import { createClient } from "@/lib/db/supabase";
import type { Workout } from "@/lib/modules/fitness";

function toWorkout(row: Record<string, unknown>): Workout {
  return {
    id: row.id as string,
    date: row.date as string,
    title: row.title as string,
    type: row.type as Workout["type"],
    distanceKm: row.distance_km != null ? Number(row.distance_km) : null,
    notes: (row.notes as string) ?? "",
    completed: row.completed as boolean,
  };
}

export const workoutsRepo = {
  async list(): Promise<Workout[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .order("date", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toWorkout);
  },

  async create(item: Omit<Workout, "id">): Promise<Workout> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("workouts")
      .insert({
        user_id: user!.id,
        date: item.date,
        title: item.title,
        type: item.type,
        distance_km: item.distanceKm,
        notes: item.notes,
        completed: item.completed,
      })
      .select()
      .single();
    if (error) throw error;
    return toWorkout(data);
  },

  async update(id: string, patch: Partial<Workout>): Promise<Workout> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("workouts")
      .update({
        ...(patch.date !== undefined && { date: patch.date }),
        ...(patch.title !== undefined && { title: patch.title }),
        ...(patch.type !== undefined && { type: patch.type }),
        ...(patch.distanceKm !== undefined && { distance_km: patch.distanceKm }),
        ...(patch.notes !== undefined && { notes: patch.notes }),
        ...(patch.completed !== undefined && { completed: patch.completed }),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return toWorkout(data);
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("workouts").delete().eq("id", id);
    if (error) throw error;
  },
};
