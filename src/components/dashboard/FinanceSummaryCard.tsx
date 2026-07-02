"use client";

import Link from "next/link";
import { Wallet } from "lucide-react";
import { BarChart, Bar, XAxis, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/Card";

export function FinanceSummaryCard({
  income,
  expenses,
}: {
  income: number;
  expenses: number;
}) {
  const data = [
    { name: "In", value: income, fill: "var(--module-fitness-text)" },
    { name: "Out", value: expenses, fill: "var(--module-finance-text)" },
  ];

  return (
    <Link href="/finance" className="block">
      <Card className="h-full hover:border-[var(--border-strong)] transition-colors">
        <div className="flex items-center gap-2 mb-3">
          <Wallet size={18} className="text-[var(--module-finance-text)]" />
          <h3 className="text-[16px] font-medium">Finance</h3>
        </div>
        <p className="text-[13px] text-[var(--text-secondary)] mb-2">This month</p>

        <div style={{ width: "100%", height: 60 }}>
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <XAxis type="number" hide />
              <Bar dataKey="value" radius={4} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-between text-[12px] text-[var(--text-secondary)] mt-1">
          <span>In ₱{income.toLocaleString()}</span>
          <span>Out ₱{expenses.toLocaleString()}</span>
        </div>
      </Card>
    </Link>
  );
}
