"use client";

import Card from "@/components/cards/Card";
import { CheckSquare, ClipboardList, Target } from "lucide-react";
import CountUp from "@/components/anim/CountUp";

export default function StatCardRow({
  metrics,
}: {
  metrics: {
    habitsToday: number;
    openTasks: number;
    goalsOnTrack: number;
    goalsTotal: number;
  };
}) {
  const items: Array<
    | {
        label: string;
        kind: "number";
        value: number;
        Icon: React.ComponentType<{ className?: string }>;
      }
    | {
        label: string;
        kind: "fraction";
        value: number; // numerator
        total: number; // denominator
        Icon: React.ComponentType<{ className?: string }>;
      }
  > = [
    {
      label: "Habits completed (today)",
      kind: "number",
      value: metrics.habitsToday,
      Icon: CheckSquare,
    },
    {
      label: "Open tasks",
      kind: "number",
      value: metrics.openTasks,
      Icon: ClipboardList,
    },
    {
      label: "Goals on track",
      kind: "fraction",
      value: metrics.goalsOnTrack,
      total: metrics.goalsTotal,
      Icon: Target,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((it) => (
        <Card key={it.label} className="p-3 md:p-4">
          <div className="flex items-center gap-3">
            <div
              className="shrink-0 rounded-lg p-2"
              style={{
                background:
                  "color-mix(in oklab, var(--twc-accent) 12%, transparent)",
                color: "var(--twc-accent)",
              }}
              aria-hidden
            >
              <it.Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="text-sm" style={{ color: "var(--twc-muted)" }}>
                {it.label}
              </div>
              <div
                className="mt-0.5 text-xl font-semibold tabular-nums"
                style={{ color: "var(--twc-text)" }}
              >
                {it.kind === "number" ? (
                  <CountUp to={it.value} duration={800} />
                ) : (
                  <>
                    <CountUp to={it.value} duration={800} />/{it.total}
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
