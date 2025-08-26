"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Minus, Plus } from "lucide-react";
import { useToast } from "@/components/ui/Toaster";
import InlineGoalTitle from "./InlineGoalTitle";
import { formatDateGB, formatDueLabel } from "@/lib/date";

type Goal = {
  id: string;
  title: string;
  description?: string | null;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string | null; // ISO when serialized
  createdAt: string; // ISO when serialized
};

export default function GoalCard({ goal }: { goal: Goal }) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [local, setLocal] = useState(goal);

  const pct = Math.max(
    0,
    Math.min(100, Math.round((local.currentValue / local.targetValue) * 100))
  );

  async function patch(data: Partial<Goal>) {
    setBusy(true);
    try {
      const res = await fetch(`/api/goals/${local.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error("PATCH /api/goals/:id failed:", res.status, txt);
        toast({ variant: "error", title: "Update failed" });
        return;
      }
      const updated = await res.json();
      setLocal(updated);
      startTransition(() => router.refresh());
    } catch (e) {
      console.error(e);
      toast({ variant: "error", title: "Network error" });
    } finally {
      setBusy(false);
    }
  }

  const step = 1;

  function adjust(delta: number) {
    const next = Math.max(
      0,
      Math.min(local.targetValue, local.currentValue + delta)
    );
    // optimistic
    setLocal((c) => ({ ...c, currentValue: next }));
    patch({ currentValue: next });
  }

  async function handleDelete() {
    setBusy(true);
    try {
      const res = await fetch(`/api/goals/${local.id}`, { method: "DELETE" });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        console.error("DELETE /api/goals/:id failed:", res.status, t);
        toast({ variant: "error", title: "Delete failed" });
        return;
      }
      startTransition(() => router.refresh());
      toast({ variant: "success", title: "Goal deleted" });
    } catch (e) {
      console.error(e);
      toast({ variant: "error", title: "Network error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
      {/* Left: title + meta + progress */}
      <div className="min-w-0">
        {/* Title */}
        <div className="flex items-center gap-2">
          <InlineGoalTitle
            id={local.id}
            title={local.title}
            onSaved={(t) => setLocal((c) => ({ ...c, title: t }))}
          />
          <span className="text-xs text-gray-600">
            {local.currentValue}/{local.targetValue} {local.unit}
          </span>
          {local.deadline && (
            <span
              className="ml-1 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700"
              title={formatDateGB(local.deadline)}
            >
              due {formatDueLabel(local.deadline)}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-emerald-500 transition-all"
            style={{ width: `${pct}%` }}
            aria-label="Progress"
          />
        </div>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => adjust(-step)}
          disabled={busy || isPending}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-[0.98]"
          title={`- ${step}`}
          aria-label="Decrement"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => adjust(+step)}
          disabled={busy || isPending}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-[0.98]"
          title={`+ ${step}`}
          aria-label="Increment"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={busy || isPending}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 active:scale-[0.98]"
          aria-label="Delete goal"
          title="Delete goal"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
