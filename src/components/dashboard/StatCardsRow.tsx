"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import StatCard from "@/components/cards/StatCard";
import type { LucideIcon } from "lucide-react";
import { Activity, ListTodo, Target } from "lucide-react";

/** Data-only item sent from server */
export type StatItem = {
  label: string;
  value: number; // animate from 0 -> value
  total?: number; // if provided, display as `${animated}/${total}`
  delta?: string;
  positive?: boolean;
  iconKey: "activity" | "tasks" | "target";
};

const ICONS: Record<StatItem["iconKey"], LucideIcon> = {
  activity: Activity,
  tasks: ListTodo,
  target: Target,
};

function easeOutCubic(p: number) {
  return 1 - Math.pow(1 - p, 3);
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(!!mql?.matches);
    update();
    mql?.addEventListener?.("change", update);
    return () => mql?.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

/**
 * Count up 0 -> target over `duration` ms.
 * Respects prefers-reduced-motion.
 */
function useCountUp(target: number, duration = 1000) {
  const reduced = usePrefersReducedMotion();
  const [val, setVal] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!Number.isFinite(target) || target <= 0 || reduced) {
      setVal(target);
      return;
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = null;
    setVal(0);

    const step = (ts: number) => {
      if (startRef.current == null) startRef.current = ts;
      const t = ts - startRef.current;
      const p = Math.min(1, t / duration);
      const current = Math.round(easeOutCubic(p) * target);
      setVal(current);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, reduced]);

  return val;
}

export default function StatCardsRow({ items }: { items: StatItem[] }) {
  // Slightly stagger the three cards for a pleasant entrance
  const durations = useMemo(() => [900, 1000, 1100], []);
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {items.map((it, i) => {
        const Icon = ICONS[it.iconKey];
        const animated = useCountUp(it.value, durations[i % durations.length]);

        const display: string | number =
          typeof it.total === "number" ? `${animated}/${it.total}` : animated;

        return (
          <StatCard
            key={`${it.label}-${i}`}
            label={it.label}
            value={display}
            delta={it.delta ?? ""}
            positive={!!it.positive}
            icon={Icon}
          />
        );
      })}
    </div>
  );
}
