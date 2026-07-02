"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { Task } from "@/lib/types/core";

const MODULE_DOT: Record<string, string> = {
  fitness: "var(--module-fitness-text)",
  student: "var(--module-student-text)",
  finance: "var(--module-finance-text)",
};

export function TodoList({
  autoTasks,
  manualTasks,
  onToggleAuto,
  onToggleManual,
  onAddManual,
  onRemoveManual,
}: {
  autoTasks: Task[];
  manualTasks: Task[];
  onToggleAuto: (task: Task) => void;
  onToggleManual: (id: string, done: boolean) => void;
  onAddManual: (title: string) => void;
  onRemoveManual: (id: string) => void;
}) {
  const [newTitle, setNewTitle] = useState("");

  const allTasks = [...autoTasks, ...manualTasks];
  const doneCount = allTasks.filter((t) => t.done).length;

  function addTask() {
    const title = newTitle.trim();
    if (!title) return;
    onAddManual(title);
    setNewTitle("");
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[16px] font-medium">Today</h2>
        <span className="text-[13px] text-[var(--text-muted)]">
          {doneCount} of {allTasks.length} done
        </span>
      </div>

      <div className="flex flex-col gap-2 mb-3">
        {autoTasks.map((task) => (
          <label
            key={task.id}
            className="group flex items-center gap-3 text-[14px] cursor-pointer py-0.5"
          >
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => onToggleAuto(task)}
              className="w-4 h-4 accent-[var(--fill-accent)]"
            />
            {task.module && (
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: MODULE_DOT[task.module] ?? "var(--text-muted)" }}
              />
            )}
            <span className={task.done ? "text-[var(--text-muted)] line-through" : ""}>
              {task.title}
            </span>
          </label>
        ))}
        {manualTasks.map((task) => (
          <div key={task.id} className="group flex items-center gap-3 text-[14px] py-0.5">
            <label className="flex items-center gap-3 flex-1 cursor-pointer min-w-0">
              <input
                type="checkbox"
                checked={task.done}
                onChange={(e) => onToggleManual(task.id, e.target.checked)}
                className="w-4 h-4 accent-[var(--fill-accent)] shrink-0"
              />
              <span className={task.done ? "text-[var(--text-muted)] line-through truncate" : "truncate"}>
                {task.title}
              </span>
            </label>
            <button
              onClick={() => onRemoveManual(task.id)}
              aria-label="Remove task"
              className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--text-danger)] transition-opacity shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {allTasks.length === 0 && (
          <p className="text-[13px] text-[var(--text-muted)] py-1">Nothing on your plate today.</p>
        )}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a task"
          className="flex-1 text-[14px] bg-transparent outline-none placeholder:text-[var(--text-muted)]"
        />
        <button
          onClick={addTask}
          className="text-[var(--text-muted)] hover:text-[var(--text-accent)] transition-colors"
          aria-label="Add task"
        >
          <Plus size={18} />
        </button>
      </div>
    </Card>
  );
}
