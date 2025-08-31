"use client";

import CountUp from "@/components/anim/CountUp";

export default function StreakMetric({
  label,
  value,
  duration = 900,
}: {
  label: string;
  value: number;
  duration?: number;
}) {
  return (
    <div
      className="rounded-lg p-3"
      style={{
        border: "1px solid var(--twc-border)",
        backgroundColor: "var(--twc-surface)",
      }}
    >
      <div className="text-xs" style={{ color: "var(--twc-muted)" }}>
        {label}
      </div>
      <div
        className="mt-1 text-lg font-semibold"
        style={{ color: "var(--twc-text)" }}
      >
        <CountUp
          to={value}
          duration={duration}
          format={(n) => `${n} ${n === 1 ? "day" : "days"}`}
        />
      </div>
    </div>
  );
}
