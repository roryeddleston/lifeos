// src/components/goals/GoalCard.tsx
"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Calculator, Check } from "lucide-react";
import { useToast } from "@/components/ui/Toaster";
import InlineGoalTitle from "./InlineGoalTitle";
import { formatDateGB, formatDueLabel } from "@/lib/date";
import TrashButton from "@/components/ui/TrashButton";
import { updateGoal, deleteGoal } from "@/app/(app)/goals/actions";

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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setCustomOpen(false);
        setCustomAmount("");
      }
    }
    if (customOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [customOpen]);

  const pct =
    local.targetValue > 0
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round((local.currentValue / local.targetValue) * 100)
          )
        )
      : 0;

  function clampToRange(v: number) {
    return Math.max(0, Math.min(local.targetValue, v));
  }

  function mutate(patch: Partial<Goal>) {
    setBusy(true);
    // optimistic
    setLocal((c) => ({ ...c, ...patch }));
    startTransition(async () => {
      try {
        await updateGoal(local.id, {
          ...(patch.title !== undefined ? { title: patch.title } : {}),
          ...(patch.description !== undefined
            ? { description: patch.description }
            : {}),
          ...(patch.targetValue !== undefined
            ? { targetValue: Number(patch.targetValue) }
            : {}),
          ...(patch.currentValue !== undefined
            ? { currentValue: Number(patch.currentValue) }
            : {}),
          ...(patch.unit !== undefined ? { unit: patch.unit } : {}),
          ...(patch.deadline !== undefined ? { deadline: patch.deadline } : {}),
        });
        router.refresh();
      } catch {
        toast({ variant: "error", title: "Update failed" });
        setLocal(goal); // rollback simple
      } finally {
        setBusy(false);
      }
    });
  }

  function adjust(delta: number) {
    const next = clampToRange(local.currentValue + delta);
    mutate({ currentValue: next });
  }

  function applyCustom() {
    const n = Number(customAmount);
    if (!Number.isFinite(n) || n <= 0) {
      toast({ variant: "error", title: "Enter a positive number" });
      return;
    }
    const next = clampToRange(local.currentValue + n);
    mutate({ currentValue: next });
    setCustomAmount("");
    setCustomOpen(false);
  }

  function onDelete() {
    setBusy(true);
    startTransition(async () => {
      try {
        await deleteGoal(local.id);
        router.refresh();
        toast({ variant: "success", title: "Goal deleted" });
      } catch {
        toast({ variant: "error", title: "Delete failed" });
      } finally {
        setBusy(false);
      }
    });
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

        <div
          className="mt-2 h-2 w-full rounded-full"
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

        {customOpen && (
          <div
            ref={panelRef}
            className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-lg p-2 md:gap-4"
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
              className={`inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm text-white transition active:scale-[0.98] ${
                customAmount.trim() !== "" && Number(customAmount) > 0
                  ? "bg-[var(--twc-accent)] cursor-pointer"
                  : "bg-[var(--twc-accent)] opacity-50 cursor-not-allowed"
              }`}
            >
              <Check className="h-4 w-4" />
              Save
            </button>

            <button
              type="button"
              className={`${btnBase} h-8 px-3`}
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

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => adjust(-1)}
          disabled={busy || isPending}
          className={`${btnBase} h-8 w-8`}
          style={boxStyle}
          aria-label="Decrement"
          title="Decrement"
        >
          <Minus className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => adjust(+1)}
          disabled={busy || isPending}
          className={`${btnBase} h-8 w-8`}
          style={boxStyle}
          aria-label="Increment"
          title="Increment"
        >
          <Plus className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setCustomOpen(true)}
          className={`${btnBase} h-8 w-auto gap-1 px-2`}
          style={boxStyle}
          aria-expanded={customOpen}
          title="Custom adjust"
        >
          <Calculator className="h-4 w-4" />
          <span className="text-xs">Custom</span>
        </button>

        <TrashButton
          onClick={onDelete}
          disabled={busy || isPending}
          aria-label="Delete goal"
          title="Delete goal"
        />
      </div>
    </div>
  );
}
