import { createClient } from "@/lib/db/supabase";
import type { FitnessEvent } from "@/lib/modules/fitness";

function toEvent(row: Record<string, unknown>): FitnessEvent {
  return {
    id: row.id as string,
    date: row.date as string,
    title: row.title as string,
    type: row.type as FitnessEvent["type"],
    distanceKm: row.distance_km != null ? Number(row.distance_km) : null,
    location: (row.location as string) ?? "",
    notes: (row.notes as string) ?? "",
  };
}

export const fitnessEventsRepo = {
  async list(): Promise<FitnessEvent[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("fitness_events")
      .select("*")
      .order("date", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toEvent);
  },

  async create(item: Omit<FitnessEvent, "id">): Promise<FitnessEvent> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("fitness_events")
      .insert({
        user_id: user!.id,
        date: item.date,
        title: item.title,
        type: item.type,
        distance_km: item.distanceKm,
        location: item.location,
        notes: item.notes,
      })
      .select()
      .single();
    if (error) throw error;
    return toEvent(data);
  },

  async update(id: string, patch: Partial<FitnessEvent>): Promise<FitnessEvent> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("fitness_events")
      .update({
        ...(patch.date !== undefined && { date: patch.date }),
        ...(patch.title !== undefined && { title: patch.title }),
        ...(patch.type !== undefined && { type: patch.type }),
        ...(patch.distanceKm !== undefined && { distance_km: patch.distanceKm }),
        ...(patch.location !== undefined && { location: patch.location }),
        ...(patch.notes !== undefined && { notes: patch.notes }),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return toEvent(data);
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("fitness_events").delete().eq("id", id);
    if (error) throw error;
  },
};
