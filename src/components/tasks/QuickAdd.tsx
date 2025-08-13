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
import { formatDateGB } from "@/lib/date";

type Task = {
  id: string;
  title: string;
  dueDate: string | null;
  status: string;
};

export default function QuickAdd() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [optimistic, addOptimistic] = useOptimistic<Task[]>(
    [],
    (state, newOnes: Task[]) => [...newOnes, ...state]
  );
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Autofocus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 'q' focuses input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === "q" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function splitLines(raw: string) {
    return raw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function toPayload(lines: string) {
    return splitLines(lines).map((line) => {
      const iso = parseQuickDate(line); // 'YYYY-MM-DD' or null
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

    // Optimistic preview (wrap in transition)
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
        alert(`Could not create tasks (HTTP ${res.status})`);
        return;
      }

      // Revalidate list, clear, and refocus
      startTransition(() => router.refresh());
      setValue("");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
      });
    } catch (e) {
      console.error(e);
      alert("Could not create tasks");
    } finally {
      setSubmitting(false);
    }
  }

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      // Cmd/Ctrl+Enter: add all lines
      e.preventDefault();
      const text = value.trim();
      if (text) createMany(text);
    } else if (e.key === "Enter" && !e.shiftKey) {
      // Enter on single line: add that one task
      const lines = splitLines(value);
      if (lines.length <= 1) {
        e.preventDefault();
        if (lines[0]) createMany(lines[0]);
      }
    }
    // Shift+Enter -> newline (do nothing)
  };

  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm">
      <label className="block text-sm font-medium mb-2">Quick add</label>
      <textarea
        ref={inputRef}
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type a task and press Enter"
        className="w-full resize-none rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
        rows={3}
        disabled={submitting}
      />
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="flex items-center gap-1">
            <kbd className="rounded border px-1">Enter</kbd> add
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border px-1">Shift</kbd>+
            <kbd className="rounded border px-1">Enter</kbd> newline
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border px-1">⌘</kbd>/
            <kbd className="rounded border px-1">Ctrl</kbd>+
            <kbd className="rounded border px-1">Enter</kbd> add all
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border px-1">q</kbd> focus
          </span>
        </div>
        <button
          onClick={() => {
            const text = value.trim();
            if (text) createMany(text);
          }}
          disabled={submitting || !value.trim()}
          className="rounded-md bg-gray-900 text-white px-3 py-1.5 hover:bg-black disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {/* Optional optimistic preview */}
      {optimistic.length > 0 && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {optimistic.slice(0, 4).map((t) => (
            <div
              key={t.id}
              className="rounded-md border px-2 py-1 text-sm flex items-center justify-between"
            >
              <span className="truncate">{t.title}</span>
              <span className="text-gray-500 text-xs ml-2">
                {t.dueDate ? formatDateGB(t.dueDate) : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
