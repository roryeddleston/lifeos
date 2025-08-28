"use client";

import {
  useEffect,
  useOptimistic,
  useRef,
  useState,
  startTransition,
} from "react";
import { useRouter } from "next/navigation";
import { parseQuickDate } from "@/lib/quickdate";
import { useToast } from "@/components/ui/Toaster";

type Task = {
  id: string;
  title: string;
  dueDate: string | null;
  status: string;
};

function todayLocalISO(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10); // YYYY-MM-DD in local time
}

export default function QuickAdd() {
  const router = useRouter();
  const toast = useToast();

  const [value, setValue] = useState("");
  // Default to today 👇
  const [selectedDate, setSelectedDate] = useState<string | null>(
    todayLocalISO()
  );
  const [submitting, setSubmitting] = useState(false);

  // Only need the updater, not the optimistic state itself
  const [, addOptimistic] = useOptimistic<Task[]>([]);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function splitLines(raw: string) {
    return raw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function toPayload(lines: string) {
    return splitLines(lines).map((line) => {
      const parsedISO = parseQuickDate(line); // Natural date in text
      const iso = parsedISO ?? selectedDate ?? null;
      const cleaned = line
        .replace(
          /\b(today|tomorrow|sun|mon|tue|wed|thu|fri|sat|in\s+\d+\s+days?)\b/gi,
          ""
        )
        .replace(/\s{2,}/g, " ")
        .trim();
      const title =
        cleaned.length > 0
          ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
          : cleaned;
      return { title: title || line, dueDate: iso };
    });
  }

  async function createMany(lines: string) {
    const tasksPayload = toPayload(lines);
    if (tasksPayload.length === 0) return;

    // Optimistic placeholders (local only)
    const optimisticTasks: Task[] = tasksPayload.map((t) => ({
      id: crypto.randomUUID(),
      title: t.title,
      dueDate: t.dueDate ?? null,
      status: "TODO",
    }));
    startTransition(() => addOptimistic(optimisticTasks));

    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: tasksPayload }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("POST /api/tasks/bulk failed:", res.status, text);
        toast({
          variant: "error",
          title: "Could not create task(s)",
          description: `HTTP ${res.status}`,
        });
        return;
      }

      startTransition(() => router.refresh());
      setValue("");
      // Keep default at today after submit
      setSelectedDate(todayLocalISO());

      // Preserve focus—run on next frame to avoid blurring
      requestAnimationFrame(() => {
        requestAnimationFrame(() => inputRef.current?.focus());
      });

      toast({
        variant: "success",
        title: tasksPayload.length > 1 ? "Tasks added" : "Task added",
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: "error",
        title: "Network error",
        description: "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      const text = value.trim();
      if (text) createMany(text);
    } else if (e.key === "Enter" && !e.shiftKey) {
      const lines = splitLines(value);
      if (lines.length <= 1) {
        e.preventDefault();
        if (lines[0]) createMany(lines[0]);
      }
    }
  };

  return (
    <div
      className="rounded-xl p-3 space-y-3"
      style={{
        border: "1px solid var(--twc-border)",
        backgroundColor: "var(--twc-surface)",
      }}
    >
      <textarea
        id="quickadd"
        ref={inputRef}
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type a task and hit Enter (⌘/Ctrl+Enter for multi-line)"
        className="w-full resize-none rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--twc-accent)]"
        rows={3}
        disabled={submitting}
        aria-label="Task title"
        style={{
          borderColor: "var(--twc-border)",
          backgroundColor: "var(--twc-surface)",
          color: "var(--twc-text)",
        }}
      />

      <div className="flex items-center justify-between">
        <input
          type="date"
          value={selectedDate ?? ""}
          onChange={(e) => setSelectedDate(e.target.value || null)}
          className="rounded-md border px-2 py-1 text-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--twc-accent)]"
          aria-label="Due date (optional)"
          title="Due date (optional)"
          style={{
            borderColor: "var(--twc-border)",
            backgroundColor: "var(--twc-surface)",
            color: "var(--twc-text)",
          }}
        />

        <button
          onClick={() => {
            const text = value.trim();
            if (text) createMany(text);
          }}
          disabled={submitting || !value.trim()}
          className="rounded-md px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--twc-accent)] disabled:opacity-50"
          aria-label="Add task"
          style={{
            backgroundColor: "var(--twc-text)",
            color: "var(--twc-bg)",
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}
