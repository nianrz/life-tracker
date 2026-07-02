"use client";

import { Pencil, Trash2 } from "lucide-react";

export function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={onEdit}
        aria-label="Edit"
        className="p-1.5 rounded-[var(--radius)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)]"
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={onDelete}
        aria-label="Delete"
        className="p-1.5 rounded-[var(--radius)] text-[var(--text-muted)] hover:text-[var(--text-danger)] hover:bg-[var(--surface-1)]"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
