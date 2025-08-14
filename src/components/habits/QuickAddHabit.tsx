"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toaster";

export default function QuickAddHabit() {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function addHabit() {
    const title = name.trim();
    if (!title) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: title }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("POST /api/habits failed:", res.status, text);
        toast({ variant: "error", title: "Could not add habit" });
        return;
      }
      setName("");
      router.refresh();
      toast({ variant: "success", title: "Habit added" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl bg-white p-3 space-y-3">
      <label htmlFor="new-habit" className="block text-sm font-medium">
        New habit
      </label>
      <div className="flex gap-2">
        <input
          id="new-habit"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addHabit();
          }}
          placeholder="e.g. Drink water"
          className="flex-1 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
          disabled={submitting}
          aria-label="Habit name"
        />
        <button
          type="button"
          onClick={addHabit}
          disabled={submitting || !name.trim()}
          className="inline-flex items-center rounded-md bg-gray-900 text-white px-3 py-2 text-sm hover:bg-black disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
        >
          Add
        </button>
      </div>
    </div>
  );
}
