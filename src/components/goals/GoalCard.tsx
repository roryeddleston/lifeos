"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Minus, Plus, Calculator } from "lucide-react";
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

  // NEW: custom adjust panel
  const [customOpen, setCustomOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>("");

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

  function clampToRange(v: number) {
    return Math.max(0, Math.min(local.targetValue, v));
  }

  function adjust(delta: number) {
    const next = clampToRange(local.currentValue + delta);
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

  // NEW: handle custom amount apply (positive adds, negative subtracts)
  function applyCustom(sign: "add" | "sub") {
    const n = Number(customAmount);
    if (!Number.isFinite(n) || n <= 0) {
      toast({ variant: "error", title: "Enter a positive number" });
      return;
    }
    const delta = sign === "add" ? n : -n;
    const next = clampToRange(local.currentValue + delta);
    setLocal((c) => ({ ...c, currentValue: next }));
    setCustomAmount("");
    setCustomOpen(false);
    patch({ currentValue: next });
  }

  // Shared button classes/styles (now all clearly clickable)
  const btnBase =
    "inline-flex h-8 w-8 items-center justify-center rounded-md cursor-pointer transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2";
  const btnBox = {
    color: "var(--twc-text)",
    border: "1px solid var(--twc-border)",
    backgroundColor: "var(--twc-surface)",
  } as React.CSSProperties;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
      {/* Left: title + meta + progress */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <InlineGoalTitle
            id={local.id}
            title={local.title}
            onSaved={(t) => setLocal((c) => ({ ...c, title: t }))}
          />
          <span className="text-xs text-[var(--twc-muted)]">
            {local.currentValue}/{local.targetValue} {local.unit}
          </span>
          {local.deadline && (
            <span
              className="ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px]"
              title={formatDateGB(local.deadline)}
              style={{
                backgroundColor:
                  "color-mix(in oklab, var(--twc-text) 6%, var(--twc-surface))",
                color: "var(--twc-text)",
              }}
            >
              due {formatDueLabel(local.deadline)}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div
          className="mt-2 h-2 w-full rounded-full"
          style={{
            backgroundColor:
              "color-mix(in oklab, var(--twc-text) 6%, var(--twc-surface))",
          }}
        >
          <div
            className="h-2 rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: "var(--twc-accent)" }}
            aria-label="Progress"
          />
        </div>

        {/* Custom adjust panel */}
        {customOpen && (
          <div
            className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-lg p-2"
            style={{
              border: "1px solid var(--twc-border)",
              backgroundColor:
                "color-mix(in oklab, var(--twc-text) 4%, var(--twc-surface))",
            }}
          >
            <label className="text-xs" style={{ color: "var(--twc-muted)" }}>
              Amount
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              min={0}
              placeholder={`e.g. 10 ${local.unit}`}
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="h-8 w-28 rounded-md px-2 text-sm focus-visible:ring-2"
              style={{
                ...btnBox,
                width: "7.5rem",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyCustom("add");
                if (e.key === "Escape") {
                  setCustomAmount("");
                  setCustomOpen(false);
                }
              }}
            />
            <button
              type="button"
              className={`${btnBase} px-3 h-8 w-auto hover:opacity-90`}
              style={btnBox}
              onClick={() => applyCustom("add")}
              disabled={busy || isPending}
              aria-label="Add custom amount"
              title="Add custom amount"
            >
              Add
            </button>
            <button
              type="button"
              className={`${btnBase} px-3 h-8 w-auto hover:opacity-90`}
              style={btnBox}
              onClick={() => applyCustom("sub")}
              disabled={busy || isPending}
              aria-label="Subtract custom amount"
              title="Subtract custom amount"
            >
              Subtract
            </button>
            <button
              type="button"
              className={`${btnBase} px-3 h-8 w-auto hover:opacity-90`}
              style={btnBox}
              onClick={() => {
                setCustomAmount("");
                setCustomOpen(false);
              }}
              aria-label="Close custom adjust"
              title="Close"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => adjust(-step)}
          disabled={busy || isPending}
          className={`${btnBase} hover:opacity-90`}
          style={btnBox}
          title={`- ${step}`}
          aria-label="Decrement"
        >
          <Minus className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => adjust(+step)}
          disabled={busy || isPending}
          className={`${btnBase} hover:opacity-90`}
          style={btnBox}
          title={`+ ${step}`}
          aria-label="Increment"
        >
          <Plus className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setCustomOpen((v) => !v)}
          className={`${btnBase} w-auto px-2 gap-1 hover:opacity-90`}
          style={btnBox}
          aria-expanded={customOpen}
          aria-controls={`custom-adjust-${local.id}`}
          title="Add/subtract custom amount"
        >
          <Calculator className="h-4 w-4" />
          <span className="text-xs">Custom</span>
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={busy || isPending}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md cursor-pointer transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--twc-danger)] hover:opacity-90"
          style={{
            color: "var(--twc-danger)",
            border: "1px solid var(--twc-border)",
            backgroundColor: "var(--twc-surface)",
          }}
          aria-label="Delete goal"
          title="Delete goal"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
