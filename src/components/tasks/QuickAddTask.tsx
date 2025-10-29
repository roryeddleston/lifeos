"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { parseQuickDate } from "@/lib/quickdate";
import { useToast } from "@/components/ui/Toaster";
import AddActionButton from "@/components/ui/AddActionButton";
import { createTasksBulk } from "@/app/tasks/actions";

function todayLocalISODate(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function toFullISOStringOrNull(
  dateLike: string | null | undefined
): string | null {
  if (!dateLike) return null;
  const s = dateLike.trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `${s}T00:00:00.000Z`;
  const ts = Date.parse(s);
  return Number.isNaN(ts) ? null : new Date(ts).toISOString();
}

export default function QuickAddTask() {
  const router = useRouter();
  const toast = useToast();

  const [value, setValue] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(
    todayLocalISODate()
  );
  const [submitting, setSubmitting] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);

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
      const parsed = parseQuickDate(line); // may be "YYYY-MM-DD"
      const chosen = parsed ?? selectedDate ?? null;
      const dueISO = toFullISOStringOrNull(chosen);

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

      return { title: title || line, dueDate: dueISO };
    });
  }

  async function createMany(lines: string) {
    const tasksPayload = toPayload(lines).filter((t) => t.title.trim().length);
    if (tasksPayload.length === 0) return;

    setSubmitting(true);
    try {
      await createTasksBulk({ tasks: tasksPayload });
      startTransition(() => router.refresh());
      setValue("");
      setSelectedDate(todayLocalISODate());
      requestAnimationFrame(() => {
        requestAnimationFrame(() => inputRef.current?.focus());
      });
      toast({
        variant: "success",
        title: tasksPayload.length > 1 ? "Tasks added" : "Task added",
      });
    } catch {
      toast({
        variant: "error",
        title: "Could not create task(s)",
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
      className="space-y-3 rounded-xl p-3"
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
          className="cursor-pointer rounded-md border px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--twc-accent)]"
          aria-label="Due date (optional)"
          title="Due date (optional)"
          style={{
            borderColor: "var(--twc-border)",
            backgroundColor: "var(--twc-surface)",
            color: "var(--twc-text)",
          }}
        />

        <AddActionButton
          label="Add To-do"
          onClick={() => {
            const text = value.trim();
            if (text) createMany(text);
          }}
          disabled={submitting || !value.trim()}
          aria-label="Add task"
        />
      </div>
    </div>
  );
}
