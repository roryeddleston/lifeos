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

export default function QuickAdd() {
  const router = useRouter();
  const toast = useToast();

  const [value, setValue] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [optimistic, addOptimistic] = useOptimistic<Task[]>(
    [],
    (state, newOnes: Task[]) => [...newOnes, ...state]
  );

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

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
      const parsedISO = parseQuickDate(line); // parse "today", "tomorrow", "mon", etc.
      const iso = parsedISO ?? selectedDate ?? null;
      const cleaned = line
        .replace(
          /\b(today|tomorrow|sun|mon|tue|wed|thu|fri|sat|in\s+\d+\s+days?)\b/gi,
          ""
        )
        .replace(/\s{2,}/g, " ")
        .trim();
      return { title: cleaned || line, dueDate: iso };
    });
  }

  async function createMany(lines: string) {
    const tasksPayload = toPayload(lines);
    if (tasksPayload.length === 0) return;

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
      setSelectedDate(null); // reset chosen date after adding

      // Refocus textarea smoothly
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
    <div className="rounded-xl bg-white p-3 space-y-3">
      <textarea
        ref={inputRef}
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type a task"
        className="w-full resize-none rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300 hover:border-gray-400 transition-colors"
        rows={3}
        disabled={submitting}
        aria-label="Task title"
      />

      <div className="flex items-center gap-2">
        <input
          ref={dateRef}
          type="date"
          value={selectedDate ?? ""}
          onChange={(e) => setSelectedDate(e.target.value || null)}
          className="rounded-md border px-2 py-1 text-sm cursor-pointer hover:border-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-400 transition-colors"
          aria-label="Due date (optional)"
          title="Due date (optional)"
          disabled={submitting}
        />

        <button
          type="button"
          onClick={() => {
            const text = value.trim();
            if (text) createMany(text);
          }}
          aria-busy={submitting}
          aria-label="Add task(s)"
          title="Add task(s)"
          className="inline-flex items-center justify-center rounded-md bg-gray-900 text-white px-3 py-1.5 cursor-pointer hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Adding…" : "Add"}
        </button>
      </div>

      {/* Optional optimistic preview */}
      {optimistic.length > 0 && (
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {optimistic.slice(0, 4).map((t) => (
            <div
              key={t.id}
              className="rounded-md border px-2 py-1 text-sm flex items-center justify-between"
            >
              <span className="truncate">{t.title}</span>
              <span className="text-gray-500 text-xs ml-2">
                {t.dueDate ?? ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
