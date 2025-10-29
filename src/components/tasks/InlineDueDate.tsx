// src/components/tasks/InlineDueDate.tsx
"use client";

import { useState, useRef, startTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDueLabel } from "@/lib/date";
import { updateTask } from "@/app/tasks/actions";

export default function InlineDueDate({
  id,
  due,
  done,
}: {
  id: string;
  due: string | null;
  done: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState<string>(due ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  function save(next: string) {
    setEditing(false);
    startTransition(async () => {
      try {
        await updateTask(id, { dueDate: next || null });
        router.refresh();
      } catch {
        // noop; keep previous value on error
      }
    });
  }

  if (!editing) {
    const displayDue: string | null = val || due || null;
    return (
      <button
        type="button"
        onClick={() => {
          setEditing(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="w-full cursor-pointer rounded text-left transition-colors focus-visible:outline-none focus-visible:ring-2"
        style={{
          color: done
            ? "color-mix(in oklab, var(--twc-text) 45%, transparent)"
            : "color-mix(in oklab, var(--twc-text) 75%, transparent)",
          textDecoration: "none",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.textDecoration = "underline")
        }
        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        aria-label="Edit due date"
        title="Edit due date"
      >
        {formatDueLabel(displayDue)}
      </button>
    );
  }

  return (
    <input
      ref={inputRef}
      type="date"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => save(val)}
      onKeyDown={(e) => {
        if (e.key === "Enter") save(val);
        if (e.key === "Escape") setEditing(false);
      }}
      className="w-full bg-transparent focus:outline-none"
      style={{
        border: "none",
        borderBottom:
          "1px solid color-mix(in oklab, var(--twc-text) 18%, transparent)",
        color: "var(--twc-text)",
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderBottom = "1px solid var(--twc-accent)";
      }}
      onBlurCapture={(e) => {
        e.currentTarget.style.borderBottom =
          "1px solid color-mix(in oklab, var(--twc-text) 18%, transparent)";
      }}
      aria-label="Due date"
    />
  );
}
