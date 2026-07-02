import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4 lg:p-5 ${className}`}
    >
      {children}
    </div>
  );
}
