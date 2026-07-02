"use client";

import { useState, useMemo } from "react";
import { Wallet, Plus } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/ui/Card";
import { SecondaryButton } from "@/components/ui/Form";
import { RowActions } from "@/components/ui/RowActions";
import { TransactionForm } from "@/components/finance/TransactionForm";
import { useCrud } from "@/lib/db/useCrud";
import { transactionsRepo } from "@/lib/db/repositories/transactions";
import { getAccountBalances, type Transaction, type Account } from "@/lib/modules/finance";
import { isThisMonth, formatShortDate } from "@/lib/dates";

const ACCOUNT_LABELS: Record<Account, string> = {
  bank: "Bank",
  gcash: "GCash",
  cash: "Cash on hand",
};

const CHART_COLORS = ["#1D9E75", "#D85A30", "#7F77DD", "#D4537E", "#378ADD", "#BA7517"];



export default function FinancePage() {
  const transactions = useCrud<Transaction>(transactionsRepo);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | undefined>(undefined);

  const balances = useMemo(() => getAccountBalances(transactions.items), [transactions.items]);

  const thisMonth = useMemo(
    () => transactions.items.filter((t) => isThisMonth(t.date)),
    [transactions.items]
  );
  const income = thisMonth.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = Math.abs(thisMonth.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0));
  const net = income - expenses;

  const chartData = useMemo(() => {
    const byCategory = thisMonth
      .filter((t) => t.amount < 0)
      .reduce<Record<string, number>>((acc, t) => {
        acc[t.category] = (acc[t.category] ?? 0) + Math.abs(t.amount);
        return acc;
      }, {});
    return Object.entries(byCategory).map(([name, value]) => ({ name, value }));
  }, [thisMonth]);

  const existingCategories = useMemo(
    () => Array.from(new Set(transactions.items.map((t) => t.category))),
    [transactions.items]
  );

  function openNew() { setEditing(undefined); setFormOpen(true); }
  function openEdit(t: Transaction) { setEditing(t); setFormOpen(true); }
  function submit(data: Omit<Transaction, "id">) {
    if (editing) transactions.update(editing.id, data);
    else transactions.create(data);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Wallet size={22} className="text-[var(--module-finance-text)]" />
        <h1 className="text-[22px] font-medium">Finance</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(Object.keys(balances) as Account[]).map((acc) => (
          <Card key={acc}>
            <p className="text-[13px] text-[var(--text-muted)] mb-1">{ACCOUNT_LABELS[acc]}</p>
            <p className="text-[24px] font-medium">₱{balances[acc].toLocaleString()}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h2 className="text-[16px] font-medium mb-3">This month</h2>
          <div className="flex gap-6 text-[14px] mb-1">
            <div>
              <p className="text-[var(--text-muted)] text-[13px]">Income</p>
              <p className="text-[var(--text-success)] font-medium">+₱{income.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)] text-[13px]">Expenses</p>
              <p className="text-[var(--text-danger)] font-medium">-₱{expenses.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)] text-[13px]">Net</p>
              <p className="font-medium">₱{net.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-[16px] font-medium mb-3">Expenses by category</h2>
          {chartData.length > 0 ? (
            <div className="flex items-center gap-4">
              <div style={{ width: 100, height: 100 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={28} outerRadius={48}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `₱${Number(v).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-1 text-[12px]">
                {chartData.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-[var(--text-secondary)]">{c.name} · ₱{c.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[13px] text-[var(--text-muted)]">No expenses logged this month yet.</p>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-medium">Transactions</h2>
          <SecondaryButton onClick={openNew} className="flex items-center gap-1.5">
            <Plus size={14} /> Add
          </SecondaryButton>
        </div>

        {transactions.loading ? (
          <p className="text-[13px] text-[var(--text-muted)] py-3">Loading…</p>
        ) : (
          <div className="flex flex-col divide-y divide-[var(--border)]">
            {transactions.items.map((t) => (
              <div key={t.id} className="group flex items-center justify-between py-2.5 text-[14px]">
                <div className="min-w-0">
                  <p className="truncate">{t.category}{t.note ? ` · ${t.note}` : ""}</p>
                  <p className="text-[12px] text-[var(--text-muted)]">
                    {formatShortDate(t.date)} · {ACCOUNT_LABELS[t.account]}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[13px] font-medium ${t.amount >= 0 ? "text-[var(--text-success)]" : "text-[var(--text-danger)]"}`}>
                    {t.amount >= 0 ? "+" : "-"}₱{Math.abs(t.amount).toLocaleString()}
                  </span>
                  <RowActions onEdit={() => openEdit(t)} onDelete={() => transactions.remove(t.id)} />
                </div>
              </div>
            ))}
            {transactions.items.length === 0 && (
              <p className="text-[13px] text-[var(--text-muted)] py-3">No transactions yet. Add your first one.</p>
            )}
          </div>
        )}
      </Card>

      <TransactionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={submit}
        initial={editing}
        existingCategories={existingCategories}
      />
    </div>
  );
}
