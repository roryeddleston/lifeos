// src/components/habits/QuickAddHabit.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toaster";
import AddActionButton from "@/components/ui/AddActionButton";
import { createHabit } from "@/app/habits/actions";

export default function QuickAddHabit() {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();

  function addHabit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    startTransition(async () => {
      try {
        await createHabit({ name: trimmed });
        setName("");
        router.refresh();
        toast({ variant: "success", title: "Habit added" });
      } catch {
        toast({
          variant: "error",
          title: "Create failed",
          description: "Please try again.",
        });
      }
    });
  }

  return (
    <form onSubmit={addHabit} className="px-4">
      <div className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New habit…"
          className="flex-1 rounded-md px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--twc-accent)]"
          style={{
            border: "1px solid var(--twc-border)",
            backgroundColor: "var(--twc-surface)",
            color: "var(--twc-text)",
          }}
          disabled={isPending}
          aria-label="New habit name"
        />

        <AddActionButton
          type="submit"
          label="Add Habit"
          disabled={isPending || !name.trim()}
          aria-label="Add habit"
        />
      </div>
    </form>
  );
}
