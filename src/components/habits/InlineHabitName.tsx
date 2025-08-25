// src/components/habits/InlineHabitName.tsx
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

  // CSS-only first-letter capitalization (not each word)
  const firstLetterCap =
    "truncate text-left text-sm text-gray-900 [&::first-letter]:uppercase";

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
        className={`w-full max-w-xs rounded-md border border-transparent px-1 py-0.5 ${firstLetterCap} focus:border-gray-300 focus:outline-none`}
        autoCapitalize="sentences"
        spellCheck={false}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`w-full max-w-xs hover:underline ${firstLetterCap}`}
      title="Rename habit"
    >
      {value}
    </button>
  );
}
