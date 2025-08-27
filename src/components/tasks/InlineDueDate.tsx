"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { formatDueLabel } from "@/lib/date";

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

  async function save(next: string) {
    setEditing(false);
    const body = { dueDate: next || null };
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return;
    startTransition(() => router.refresh());
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setEditing(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="text-left w-full rounded cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2"
        // no hover background; underline on hover only
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
        {formatDueLabel(val || (due as any))}
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
