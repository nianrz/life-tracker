import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-[13px]">
      <span className="text-[var(--text-secondary)]">{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-9 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-1)] px-3 text-[14px] outline-none focus:border-[var(--border-accent)] transition-colors ${props.className ?? ""}`}
    />
  );
}

export function Select({
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-9 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-1)] px-3 text-[14px] outline-none focus:border-[var(--border-accent)] transition-colors ${props.className ?? ""}`}
    >
      {children}
    </select>
  );
}

export function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`h-9 px-4 rounded-[var(--radius)] bg-[var(--fill-accent)] text-[var(--on-accent)] text-[14px] font-medium hover:bg-[var(--fill-accent-hover)] transition-colors disabled:opacity-50 ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`h-9 px-4 rounded-[var(--radius)] border border-[var(--border)] text-[14px] hover:bg-[var(--surface-1)] transition-colors ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}
