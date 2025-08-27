"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toaster";

export default function InlineHabitName({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();

  async function save(next: string) {
    const trimmed = next.trim();
    if (!trimmed || trimmed === name) {
      setEditing(false);
      setValue(name);
      return;
    }
    try {
      const res = await fetch(`/api/habits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("PATCH /api/habits/:id failed:", res.status, text);
        toast({ variant: "error", title: "Rename failed" });
        setValue(name);
        setEditing(false);
        return;
      }
      startTransition(() => router.refresh());
      toast({ variant: "success", title: "Habit updated" });
      setEditing(false);
    } catch (err) {
      console.error(err);
      toast({ variant: "error", title: "Network error" });
      setValue(name);
      setEditing(false);
    }
  }

  const base = "truncate text-left text-sm [&::first-letter]:uppercase";

  if (editing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => save(value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            setValue(name);
            setEditing(false);
          }
        }}
        disabled={isPending}
        className={`${base} w-full max-w-xs rounded-md border px-1 py-0.5 focus:outline-none`}
        style={{
          borderColor: "transparent",
          color: "var(--twc-text)",
          backgroundColor: "var(--twc-surface)",
          boxShadow:
            "inset 0 0 0 1px color-mix(in oklab, var(--twc-text) 12%, transparent)",
        }}
        autoCapitalize="sentences"
        spellCheck={false}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`${base} hover:underline`}
      title="Rename habit"
      style={{ color: "var(--twc-text)" }}
    >
      {value}
    </button>
  );
}
