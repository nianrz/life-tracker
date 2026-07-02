import { createClient } from "@/lib/db/supabase";
import type { Deliverable } from "@/lib/modules/student";

function toDeliverable(row: Record<string, unknown>): Deliverable {
  return {
    id: row.id as string,
    title: row.title as string,
    course: row.course as string,
    type: row.type as Deliverable["type"],
    dueDate: row.due_date as string,
    weight: row.weight != null ? Number(row.weight) : null,
    grade: row.grade != null ? Number(row.grade) : null,
    done: row.done as boolean,
  };
}

export const deliverablesRepo = {
  async list(): Promise<Deliverable[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("deliverables")
      .select("*")
      .order("due_date", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toDeliverable);
  },

  async create(item: Omit<Deliverable, "id">): Promise<Deliverable> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("deliverables")
      .insert({
        user_id: user!.id,
        title: item.title,
        course: item.course,
        type: item.type,
        due_date: item.dueDate,
        weight: item.weight,
        grade: item.grade,
        done: item.done,
      })
      .select()
      .single();
    if (error) throw error;
    return toDeliverable(data);
  },

  async update(id: string, patch: Partial<Deliverable>): Promise<Deliverable> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("deliverables")
      .update({
        ...(patch.title !== undefined && { title: patch.title }),
        ...(patch.course !== undefined && { course: patch.course }),
        ...(patch.type !== undefined && { type: patch.type }),
        ...(patch.dueDate !== undefined && { due_date: patch.dueDate }),
        ...(patch.weight !== undefined && { weight: patch.weight }),
        ...(patch.grade !== undefined && { grade: patch.grade }),
        ...(patch.done !== undefined && { done: patch.done }),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return toDeliverable(data);
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("deliverables").delete().eq("id", id);
    if (error) throw error;
  },
};
