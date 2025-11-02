"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toaster";
import { updateGoal } from "@/app/(app)/goals/actions";

function capitalizeFirst(s: string) {
  if (!s) return s;
  return s[0] + s.slice(1);
}

export default function InlineGoalTitle({
  id,
  title,
  onSaved,
}: {
  id: string;
  title: string;
  onSaved?: (next: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();

  function save(next: string) {
    const trimmed = next.trim();
    if (!trimmed || trimmed === title) {
      setEditing(false);
      setValue(title);
      return;
    }
    startTransition(async () => {
      try {
        await updateGoal(id, { title: trimmed });
        onSaved?.(trimmed);
        router.refresh();
        toast({ variant: "success", title: "Goal updated" });
      } catch {
        toast({ variant: "error", title: "Rename failed" });
        setValue(title);
      } finally {
        setEditing(false);
      }
    });
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
            setValue(title);
            setEditing(false);
          }
        }}
        disabled={isPending}
        className="w-full max-w-xs truncate rounded-md border px-1 py-0.5 text-sm focus:outline-none focus-visible:ring-2"
        style={{
          borderColor: "transparent",
          color: "var(--twc-text)",
          backgroundColor:
            "color-mix(in oklab, var(--twc-text) 4%, var(--twc-surface))",
          boxShadow: "inset 0 0 0 1px var(--twc-border)",
        }}
        spellCheck={false}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="w-full max-w-xs truncate text-left text-sm hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--twc-accent)]"
      style={{ color: "var(--twc-text)" }}
      title="Rename goal"
    >
      {capitalizeFirst(value)}
    </button>
  );
}
