"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toaster";
import AddActionButton from "@/components/ui/AddActionButton";

function loginRedirect() {
  if (typeof window !== "undefined") {
    const returnTo = window.location.pathname + window.location.search;
    window.location.href = `/api/auth/login?returnTo=${encodeURIComponent(
      returnTo
    )}`;
  }
}
async function apiFetch(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  if (res.status === 401) {
    loginRedirect();
    throw new Error("Unauthorized");
  }
  return res;
}

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
      const res = await apiFetch("/api/habits", {
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
      if ((e as Error).message !== "Unauthorized") {
        console.error(e);
        toast({
          variant: "error",
          title: "Network error",
          description: "Please try again.",
        });
      }
    }
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
