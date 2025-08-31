"use client";

import type { LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  delta,
  positive,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode; // ⬅ allow <CountUp /> etc.
  delta?: string;
  positive?: boolean;
  icon: LucideIcon;
}) {
  return (
    <div
      className="rounded-xl border p-4 flex items-start gap-3 transition-colors"
      style={{
        borderColor: "var(--twc-border)",
        backgroundColor: "var(--twc-surface)",
      }}
    >
      {/* Icon — matches ComingSoon colouring */}
      <div
        className="rounded-lg p-2 flex-shrink-0"
        style={{
          background: "color-mix(in oklab, var(--twc-accent) 12%, transparent)",
          color: "var(--twc-accent)",
        }}
      >
        <Icon className="w-5 h-5" />
      </div>

      {/* Text */}
      <div className="flex-1">
        <div
          className="text-sm font-medium"
          style={{ color: "var(--twc-muted)" }}
        >
          {label}
        </div>
        <div
          className="mt-1 text-lg font-semibold tabular-nums"
          style={{ color: "var(--twc-text)" }}
        >
          {value}
        </div>
        {delta && (
          <div
            className="mt-1 text-xs font-medium"
            style={{
              color: positive ? "var(--twc-success)" : "var(--twc-danger)",
            }}
          >
            {delta}
          </div>
        )}
      </div>
    </div>
  );
}
