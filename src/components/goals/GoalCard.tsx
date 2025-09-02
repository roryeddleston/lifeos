"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Calculator, Check } from "lucide-react";
import { useToast } from "@/components/ui/Toaster";
import InlineGoalTitle from "./InlineGoalTitle";
import { formatDateGB, formatDueLabel } from "@/lib/date";
import TrashButton from "@/components/ui/TrashButton";

type Goal = {
  id: string;
  title: string;
  description?: string | null;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string | null;
  createdAt: string;
};

export default function GoalCard({ goal }: { goal: Goal }) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [local, setLocal] = useState(goal);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);

  const [customOpen, setCustomOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const customInputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    setReduced(!!mql?.matches);
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (customOpen) {
      requestAnimationFrame(() => {
        customInputRef.current?.focus();
      });
    }
  }, [customOpen]);

  // ❗️Close custom panel if clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setCustomOpen(false);
        setCustomAmount("");
      }
    }

    if (customOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [customOpen]);

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

  function applyCustom() {
    const n = Number(customAmount);
    if (!Number.isFinite(n) || n <= 0) {
      toast({ variant: "error", title: "Enter a positive number" });
      return;
    }
    const next = clampToRange(local.currentValue + n);
    setLocal((c) => ({ ...c, currentValue: next }));
    patch({ currentValue: next });
    setCustomAmount("");
    setCustomOpen(false);
  }

  const btnBase =
    "inline-flex items-center justify-center rounded-md cursor-pointer transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2";
  const boxStyle: React.CSSProperties = {
    color: "var(--twc-text)",
    border: "1px solid var(--twc-border)",
    backgroundColor: "var(--twc-surface)",
  };

  const targetWidth = `${pct}%`;
  const animatedWidth = reduced ? targetWidth : ready ? targetWidth : "0%";
  const transition = reduced
    ? "none"
    : "width 2000ms cubic-bezier(0.22, 1, 0.36, 1)";

  return (
    <div className="flex flex-col gap-4 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      {/* Left */}
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
          className="mt-2 w-full h-2 rounded-full"
          style={{
            backgroundColor:
              "color-mix(in oklab, var(--twc-text) 6%, var(--twc-surface))",
          }}
        >
          <div
            className="h-2 rounded-full"
            style={{
              width: animatedWidth,
              backgroundColor: "var(--twc-accent)",
              transition,
            }}
            aria-label="Progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            role="progressbar"
          />
        </div>

        {/* Custom Panel */}
        {customOpen && (
          <div
            ref={panelRef}
            className="mt-3 inline-flex flex-wrap items-center gap-2 md:gap-4 rounded-lg p-2"
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
              ref={customInputRef}
              type="number"
              inputMode="decimal"
              step="any"
              min={0}
              placeholder="e.g. 10"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="h-8 w-36 rounded-md px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--twc-accent)]"
              style={boxStyle}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyCustom();
                if (e.key === "Escape") {
                  setCustomAmount("");
                  setCustomOpen(false);
                }
              }}
            />

            <button
              type="button"
              onClick={applyCustom}
              disabled={customAmount.trim() === "" || Number(customAmount) <= 0}
              className={`inline-flex items-center gap-2 rounded-md px-3 text-sm text-white transition active:scale-[0.98] h-8 ${
                customAmount.trim() !== "" && Number(customAmount) > 0
                  ? "bg-[var(--twc-accent)] cursor-pointer"
                  : "bg-[var(--twc-accent)] opacity-50 cursor-not-allowed"
              }`}
            >
              <Check className="w-4 h-4" />
              Save
            </button>

            <button
              type="button"
              className={`${btnBase} px-3 h-8`}
              style={boxStyle}
              onClick={() => {
                setCustomAmount("");
                setCustomOpen(false);
              }}
              title="Close"
            >
              <span className="text-xs">Close</span>
            </button>
          </div>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => adjust(-step)}
          disabled={busy || isPending}
          className={`${btnBase} h-8 w-8`}
          style={boxStyle}
        >
          <Minus className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => adjust(+step)}
          disabled={busy || isPending}
          className={`${btnBase} h-8 w-8`}
          style={boxStyle}
        >
          <Plus className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setCustomOpen(true)}
          className={`${btnBase} w-auto px-2 gap-1 h-8`}
          style={boxStyle}
          aria-expanded={customOpen}
          title="Custom adjust"
        >
          <Calculator className="h-4 w-4" />
          <span className="text-xs">Custom</span>
        </button>

        <TrashButton
          onClick={handleDelete}
          disabled={busy || isPending}
          aria-label="Delete goal"
          title="Delete goal"
        />
      </div>
    </div>
  );
}
