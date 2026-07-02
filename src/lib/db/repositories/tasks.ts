import { createClient } from "@/lib/db/supabase";
import type { Task } from "@/lib/types/core";
import type { CrudRepo } from "@/lib/db/useCrud";

function toTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    done: row.done as boolean,
    dueDate: row.due_date as string | null,
    module: row.module as string | null,
    source: ((row.source as string) ?? "manual") as Task["source"],
    sourceRef: row.source_ref as string | null,
    createdAt: row.created_at as string,
  };
}

// Tasks repo scoped to today's manual tasks for the dashboard to-do list.
// Implements CrudRepo<Task> so it can be used directly with useCrud.
export const tasksRepo: CrudRepo<Task> = {
  async list(): Promise<Task[]> {
    const supabase = createClient();
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("due_date", today)
      .eq("source", "manual")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toTask);
  },

  async create(item: Omit<Task, "id">): Promise<Task> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user!.id,
        title: item.title,
        done: item.done,
        due_date: item.dueDate,
        module: item.module,
        source: item.source,
        source_ref: item.sourceRef,
      })
      .select()
      .single();
    if (error) throw error;
    return toTask(data);
  },

  async update(id: string, patch: Partial<Task>): Promise<Task> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tasks")
      .update({
        ...(patch.title !== undefined && { title: patch.title }),
        ...(patch.done !== undefined && { done: patch.done }),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return toTask(data);
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
  },
};
