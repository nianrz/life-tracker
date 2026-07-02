"use client";

import { useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { Field, TextInput, Select, PrimaryButton, SecondaryButton } from "@/components/ui/Form";
import { DEFAULT_CATEGORIES, type Transaction, type Account } from "@/lib/modules/finance";

const ACCOUNT_OPTIONS: { value: Account; label: string }[] = [
  { value: "bank", label: "Bank" },
  { value: "gcash", label: "GCash" },
  { value: "cash", label: "Cash on hand" },
];

const OTHER_VALUE = "__other__";

export function TransactionForm({
  open,
  onClose,
  onSubmit,
  initial,
  existingCategories = [],
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, "id">) => void;
  initial?: Transaction;
  /** Categories already used in past transactions, merged into the dropdown. */
  existingCategories?: string[];
}) {
  // Merge defaults with whatever categories the user has already used,
  // so the dropdown grows organically instead of staying fixed forever.
  const categoryOptions = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...existingCategories])
  ).sort();

  const initialIsKnown = initial ? categoryOptions.includes(initial.category) : true;

  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [kind, setKind] = useState<"income" | "expense">(
    initial ? (initial.amount >= 0 ? "income" : "expense") : "expense"
  );
  const [amount, setAmount] = useState(initial ? Math.abs(initial.amount).toString() : "");
  const [account, setAccount] = useState<Account>(initial?.account ?? "cash");
  const [categorySelect, setCategorySelect] = useState(
    initial && !initialIsKnown ? OTHER_VALUE : initial?.category ?? categoryOptions[0]
  );
  const [customCategory, setCustomCategory] = useState(
    initial && !initialIsKnown ? initial.category : ""
  );
  const [note, setNote] = useState(initial?.note ?? "");

  const isOther = categorySelect === OTHER_VALUE;
  const resolvedCategory = isOther ? customCategory.trim() : categorySelect;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0 || !resolvedCategory) return;
    onSubmit({
      date,
      amount: kind === "income" ? num : -num,
      account,
      category: resolvedCategory,
      note: note.trim(),
    });
    onClose();
  }

  return (
    <Panel open={open} onClose={onClose} title={initial ? "Edit transaction" : "Add transaction"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <Select value={kind} onChange={(e) => setKind(e.target.value as "income" | "expense")}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </Select>
          </Field>
          <Field label="Amount (₱)">
            <TextInput
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="500"
              autoFocus
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Account">
            <Select value={account} onChange={(e) => setAccount(e.target.value as Account)}>
              {ACCOUNT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Category">
          <Select value={categorySelect} onChange={(e) => setCategorySelect(e.target.value)}>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value={OTHER_VALUE}>Other…</option>
          </Select>
        </Field>
        {isOther && (
          <Field label="New category name">
            <TextInput
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="e.g. Hiking gear"
              autoFocus
            />
          </Field>
        )}
        <Field label="Note (optional)">
          <TextInput value={note} onChange={(e) => setNote(e.target.value)} placeholder="Groceries" />
        </Field>

        <div className="flex gap-2 mt-2">
          <PrimaryButton type="submit" className="flex-1">
            {initial ? "Save changes" : "Add transaction"}
          </PrimaryButton>
          <SecondaryButton type="button" onClick={onClose}>
            Cancel
          </SecondaryButton>
        </div>
      </form>
    </Panel>
  );
}
