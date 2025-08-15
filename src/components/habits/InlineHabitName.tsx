"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toaster";

function sentenceCase(s: string) {
  const t = s.trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
}

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

  async function save(nextRaw: string) {
    const next = sentenceCase(nextRaw);
    // If unchanged or empty after trim, just exit edit mode
    if (!next || next === value) {
      setEditing(false);
      return;
    }

    try {
      const res = await fetch(`/api/habits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: next }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("PATCH /api/habits/:id failed:", res.status, text);
        toast({ variant: "error", title: "Rename failed" });
        setEditing(false);
        return;
      }
      setValue(next); // reflect immediately
      startTransition(() => router.refresh());
      toast({ variant: "success", title: "Habit updated" });
      setEditing(false);
    } catch (err) {
      console.error(err);
      toast({ variant: "error", title: "Network error" });
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => save(value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          else if (e.key === "Escape") {
            setEditing(false);
          }
        }}
        disabled={isPending}
        className="w-full max-w-xs truncate rounded-md border border-transparent px-1 py-0.5 text-sm normal-case focus:border-gray-300 focus:outline-none"
        autoCapitalize="sentences"
        spellCheck={false}
        aria-label="Edit habit name"
        placeholder="Habit name"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="w-full max-w-xs truncate text-left text-sm text-gray-900 normal-case hover:underline"
      title="Rename habit"
      aria-label="Rename habit"
    >
      {sentenceCase(value)}
    </button>
  );
}
