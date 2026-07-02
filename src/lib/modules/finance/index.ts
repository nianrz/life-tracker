import type { ModuleDefinition, Task, DashboardSummary } from "@/lib/types/core";

export type Account = "bank" | "gcash" | "cash";

// Default categories shown in the dropdown. Users can type a new one via
// the "Other" option, and whatever they type becomes available again next
// time (collected from existing transactions) without needing a fixed list
// stored anywhere.
export const DEFAULT_CATEGORIES = [
  "Allowance",
  "Food",
  "Transport",
  "School",
  "Subscriptions",
  "Gift",
  "Health",
  "Shopping",
] as const;

export interface Transaction {
  id: string;
  date: string; // ISO date
  amount: number; // positive = income, negative = expense
  account: Account;
  category: string;
  note: string;
}

export const FINANCE_TRANSACTIONS_KEY = "lifetracker.finance.transactions";

// Seed data: used both as the localStorage seed (client-side CRUD) and as
// the fallback for server-rendered dashboard summaries.
export const SEED_TRANSACTIONS: Transaction[] = [
  { id: "t1", date: "2026-06-01", amount: 8000, account: "bank", category: "Allowance", note: "Monthly allowance" },
  { id: "t2", date: "2026-06-03", amount: -1200, account: "gcash", category: "Food", note: "Groceries" },
  { id: "t3", date: "2026-06-05", amount: -800, account: "cash", category: "Transport", note: "Grab + jeepney" },
  { id: "t4", date: "2026-06-10", amount: -1500, account: "bank", category: "School", note: "Printing + materials" },
  { id: "t5", date: "2026-06-15", amount: 1600, account: "gcash", category: "Gift", note: "Birthday gift" },
  { id: "t6", date: "2026-06-20", amount: -1100, account: "cash", category: "Food", note: "Eating out" },
  { id: "t7", date: "2026-06-22", amount: -500, account: "gcash", category: "Subscriptions", note: "Streaming" },
];

export function getAccountBalances(transactions: Transaction[]): Record<Account, number> {
  const balances: Record<Account, number> = { bank: 0, gcash: 0, cash: 0 };
  for (const t of transactions) {
    balances[t.account] += t.amount;
  }
  return balances;
}

function isThisMonth(iso: string): boolean {
  const now = new Date();
  const d = new Date(iso + "T00:00:00");
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

async function getTodayTasks(_userId: string): Promise<Task[]> {
  // Finance doesn't generate daily auto-tasks by default; could add
  // "log today's expenses" reminder later if desired.
  return [];
}

async function getDashboardSummary(_userId: string): Promise<DashboardSummary> {
  const thisMonth = SEED_TRANSACTIONS.filter((t) => isThisMonth(t.date));
  const income = thisMonth.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = thisMonth.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0);
  const net = income + expenses;

  return {
    module: "finance",
    headline: `₱${net.toLocaleString()} net this month`,
    data: {
      income,
      expenses: Math.abs(expenses),
      net,
      balances: getAccountBalances(SEED_TRANSACTIONS),
    },
  };
}

export const financeModule: ModuleDefinition = {
  id: "finance",
  label: "Finance",
  icon: "wallet",
  route: "/finance",
  color: "coral",
  getTodayTasks,
  getDashboardSummary,
};
