import { createClient } from "@/lib/db/supabase";
import type { Transaction } from "@/lib/modules/finance";

function toTransaction(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    date: row.date as string,
    amount: Number(row.amount),
    account: row.account as Transaction["account"],
    category: row.category as string,
    note: (row.note as string) ?? "",
  };
}

export const transactionsRepo = {
  async list(): Promise<Transaction[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toTransaction);
  },

  async create(item: Omit<Transaction, "id">): Promise<Transaction> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: user!.id,
        date: item.date,
        amount: item.amount,
        account: item.account,
        category: item.category,
        note: item.note,
      })
      .select()
      .single();
    if (error) throw error;
    return toTransaction(data);
  },

  async update(id: string, patch: Partial<Transaction>): Promise<Transaction> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("transactions")
      .update({
        ...(patch.date !== undefined && { date: patch.date }),
        ...(patch.amount !== undefined && { amount: patch.amount }),
        ...(patch.account !== undefined && { account: patch.account }),
        ...(patch.category !== undefined && { category: patch.category }),
        ...(patch.note !== undefined && { note: patch.note }),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return toTransaction(data);
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) throw error;
  },
};
