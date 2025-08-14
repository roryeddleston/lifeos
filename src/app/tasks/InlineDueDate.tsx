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
    // Allow empty (clear due date)
    const body = { dueDate: next || null };
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return; // keep silent for now
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
        className={`text-left w-full rounded cursor-pointer hover:bg-gray-100 transition-colors px-1 ${
          done ? "text-gray-400" : ""
        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300`}
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
      className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
      aria-label="Due date"
    />
  );
}
