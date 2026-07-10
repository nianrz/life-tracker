"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import type { ReactNode } from "react";

export function Panel({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  // Paired with overscroll-contain on the scrollable panel below: stops the
  // page behind the panel from scrolling on iOS without the jump/reflow
  // that a position:fixed body lock causes.
  useEffect(() => {
    if (!open) return;

    const { style } = document.body;
    const previousOverflow = style.overflow;
    style.overflow = "hidden";

    return () => {
      style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/30">
      <div
        className="w-full sm:max-w-md bg-[var(--surface-2)] rounded-t-2xl sm:rounded-2xl border border-[var(--border)] p-5 max-h-[85vh] overflow-y-auto overscroll-contain"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-medium">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
