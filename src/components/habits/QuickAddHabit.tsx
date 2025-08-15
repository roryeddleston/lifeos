"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toaster";

export default function QuickAddHabit() {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();

  async function addHabit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("POST /api/habits failed:", res.status, text);
        toast({
          variant: "error",
          title: "Create failed",
          description: `HTTP ${res.status}`,
        });
        return;
      }
      setName("");
      startTransition(() => router.refresh());
      toast({ variant: "success", title: "Habit added" });
    } catch (e) {
      console.error(e);
      toast({
        variant: "error",
        title: "Network error",
        description: "Please try again.",
      });
    }
  }

  return (
    <form onSubmit={addHabit} className="px-4">
      <div className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New habit…"
          className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm"
          disabled={isPending}
        />
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
          disabled={isPending || !name.trim()}
        >
          Add
        </button>
      </div>
    </form>
  );
}
