// src/components/dashboard/StatCardRow.tsx
"use client";

import Card from "@/components/cards/Card";
import { CheckSquare, ClipboardList, Target, CheckCircle2 } from "lucide-react";

export default function StatCardRow({
  metrics,
}: {
  metrics: {
    habitsToday: number;
    openTasks: number;
    goalsOnTrack: number;
    goalsTotal: number;
    tasksDone7d: number;
  };
}) {
  const items = [
    {
      label: "Habits completed (today)",
      value: String(metrics.habitsToday),
      Icon: CheckSquare,
    },
    {
      label: "Open tasks",
      value: String(metrics.openTasks),
      Icon: ClipboardList,
    },
    {
      label: "Goals on track",
      value: `${metrics.goalsOnTrack}/${metrics.goalsTotal}`,
      Icon: Target,
    },
    {
      label: "Tasks done (7d)",
      value: String(metrics.tasksDone7d),
      Icon: CheckCircle2,
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {items.map(({ label, value, Icon }) => (
        <Card key={label} className="p-4">
          <div className="flex items-center gap-3">
            <div
              className="rounded-lg p-2 shrink-0"
              style={{
                background:
                  "color-mix(in oklab, var(--twc-accent) 12%, transparent)",
                color: "var(--twc-accent)",
              }}
              aria-hidden
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-sm" style={{ color: "var(--twc-muted)" }}>
                {label}
              </div>
              <div
                className="mt-0.5 text-2xl font-semibold tabular-nums"
                style={{ color: "var(--twc-text)" }}
              >
                {value}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
