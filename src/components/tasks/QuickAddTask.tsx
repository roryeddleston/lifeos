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
import AddActionButton from "@/components/ui/AddActionButton";

type Task = {
  id: string;
  title: string;
  dueDate: string | null;
  status: string;
};

function todayLocalISODate(): string {
  // returns YYYY-MM-DD in local time
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

/** Coerce 'YYYY-MM-DD' (or already-ISO) into full ISO datetime string */
function toFullISOStringOrNull(
  dateLike: string | null | undefined
): string | null {
  if (!dateLike) return null;
  const s = dateLike.trim();
  if (!s) return null;
  // If already a parseable ISO, keep it
  const parsed = Date.parse(s);
  if (!Number.isNaN(parsed) && /t/i.test(s)) {
    return new Date(parsed).toISOString();
  }
  // If YYYY-MM-DD, make it midnight UTC
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return new Date(`${s}T00:00:00.000Z`).toISOString();
  }
  // Last resort: try Date(...)
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export default function QuickAdd() {
  const router = useRouter();
  const toast = useToast();

  const [value, setValue] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(
    todayLocalISODate()
  );
  const [submitting, setSubmitting] = useState(false);

  // Only need the updater, not the optimistic state itself
  const [, addOptimistic] = useOptimistic<Task[]>([]);

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
      // parseQuickDate may return YYYY-MM-DD; normalize to full ISO
      const parsed = parseQuickDate(line); // e.g. "2025-09-03" or undefined
      const chosen = parsed ?? selectedDate ?? null;
      const dueISO = toFullISOStringOrNull(chosen);

      // Strip date tokens from title (keep your patterns)
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

    // Optimistic placeholders (local only)
    startTransition(() =>
      addOptimistic(
        tasksPayload.map((t) => ({
          id: crypto.randomUUID(),
          title: t.title,
          // keep UI-friendly YYYY-MM-DD for optimistic display if you like
          dueDate: selectedDate ?? null,
          status: "TODO",
        }))
      )
    );

    setSubmitting(true);
    try {
      // 1) Primary attempt: send { tasks } with normalized ISO datetimes
      let res = await fetch("/api/tasks/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: tasksPayload }),
      });

      // 2) If server still says "No valid tasks", try { text } fallback
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        // Try fallback only if the server complained about validity
        if (/No valid tasks/i.test(text)) {
          res = await fetch("/api/tasks/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: lines }),
          });
        }
        if (!res.ok) {
          console.error(
            "POST /api/tasks/bulk failed:",
            res.status,
            text || (await res.text().catch(() => ""))
          );
          toast({
            variant: "error",
            title: "Could not create task(s)",
            description: `HTTP ${res.status}`,
          });
          return;
        }
      }

      startTransition(() => router.refresh());
      setValue("");
      setSelectedDate(todayLocalISODate());

      // Preserve focus next frame
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

        <AddActionButton
          label="Add To-do"
          onClick={(e) => {
            if (e?.currentTarget?.type !== "button") {
              // no-op; most implementations set type=button already
            }
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
