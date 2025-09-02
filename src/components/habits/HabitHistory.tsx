"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Card from "@/components/cards/Card";

type WeeklyPoint = {
  week: string;
  pct: number;
};

type HistoryPayload = {
  id: string;
  name: string;
  series: WeeklyPoint[];
  countWeeks: number;
};

export default function HabitHistory({ id }: { id: string }) {
  const [data, setData] = useState<HistoryPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`/api/habits/${id}/history`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as HistoryPayload;
        if (!cancelled) setData(json);
      } catch (e: unknown) {
        const msg =
          e instanceof Error
            ? e.message
            : typeof e === "string"
            ? e
            : "Failed to load";
        if (!cancelled) setErr(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const realSeries = useMemo(() => data?.series ?? [], [data]);
  const n = realSeries.length;

  const H = 128;
  const PL = 38;
  const PR = 16;
  const PT = 26;
  const PB = 26;
  const step = 18;
  const W = Math.max(360, PL + PR + Math.max(0, n - 1) * step);

  const y = useCallback((pct: number) => PT + (1 - pct) * (H - PT - PB), []);

  const xs = useMemo(() => {
    if (n <= 1) return [PL];
    return Array.from(
      { length: n },
      (_, i) => PL + i * ((W - PL - PR) / (n - 1))
    );
  }, [n, W]);

  const path = useMemo(() => {
    return realSeries
      .map((pt, i) => {
        const xi = xs[i];
        const yi = y(pt.pct);
        return i === 0 ? `M ${xi} ${yi}` : `L ${xi} ${yi}`;
      })
      .join(" ");
  }, [realSeries, xs, y]);

  // === UI States ===
  if (loading) {
    return (
      <div
        className="text-[11px] px-2 py-1.5 rounded-md"
        style={{
          border: "1px solid var(--twc-border)",
          background: "color-mix(in oklab, var(--twc-bg) 85%, transparent)",
          color: "var(--twc-muted)",
        }}
      >
        Loading history…
      </div>
    );
  }

  if (err) {
    return (
      <div
        className="text-[11px] px-2 py-1.5 rounded-md"
        style={{
          border: "1px solid var(--twc-border)",
          background: "color-mix(in oklab, var(--twc-bg) 85%, transparent)",
          color: "var(--twc-danger)",
        }}
      >
        {err}
      </div>
    );
  }

  if (n === 0) {
    return (
      <div
        className="text-[11px] px-2 py-1.5 rounded-md"
        style={{
          border: "1px solid var(--twc-border)",
          background: "color-mix(in oklab, var(--twc-bg) 85%, transparent)",
          color: "var(--twc-muted)",
        }}
      >
        No history yet. Start checking off habits to build your streak.
      </div>
    );
  }

  if (n < 4) {
    return (
      <Card
        title="Habit history"
        subtitle="Track your habit over time"
        className="border"
      >
        <div className="p-4 md:p-6 text-sm text-muted">
          <p className="mb-2 font-medium text-center">
            Not enough data just yet
          </p>
          <p className="text-center text-[13px] leading-snug">
            Once you’ve logged at least 4 weeks of completions, your habit
            history will be shown here.
          </p>
        </div>
      </Card>
    );
  }
  const lastWeekPct =
    n >= 2
      ? Math.round(realSeries[n - 2].pct * 100)
      : Math.round(realSeries[n - 1].pct * 100);
  const avgPct =
    n > 0
      ? Math.round(
          (realSeries.slice(-8).reduce((sum, pt) => sum + pt.pct, 0) /
            Math.min(8, n)) *
            100
        )
      : 0;
  const bestWeekPct = Math.round(
    Math.max(...realSeries.map((pt) => pt.pct)) * 100
  );

  // === Chart Rendering ===
  return (
    <div
      className="rounded-md px-3 py-4"
      style={{
        border: "1px solid var(--twc-border)",
        backgroundColor: "color-mix(in oklab, var(--twc-bg) 85%, transparent)",
      }}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div
          className="text-[11px] font-medium"
          style={{ color: "var(--twc-text)" }}
        >
          History
        </div>
        <div className="text-[10px]" style={{ color: "var(--twc-muted)" }}>
          {n} weeks
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        <div
          className="rounded-[8px] px-2 py-1.5"
          style={{ border: "1px solid var(--twc-border)" }}
        >
          <div className="text-[10px]" style={{ color: "var(--twc-muted)" }}>
            Last week
          </div>
          <div
            className="text-sm font-semibold"
            style={{ color: "var(--twc-text)" }}
          >
            {lastWeekPct}%
          </div>
        </div>
        <div
          className="rounded-[8px] px-2 py-1.5"
          style={{ border: "1px solid var(--twc-border)" }}
        >
          <div className="text-[10px]" style={{ color: "var(--twc-muted)" }}>
            Avg (8w)
          </div>
          <div
            className="text-sm font-semibold"
            style={{ color: "var(--twc-text)" }}
          >
            {avgPct}%
          </div>
        </div>
        <div
          className="rounded-[8px] px-2 py-1.5"
          style={{ border: "1px solid var(--twc-border)" }}
        >
          <div className="text-[10px]" style={{ color: "var(--twc-muted)" }}>
            Best week
          </div>
          <div
            className="text-sm font-semibold"
            style={{ color: "var(--twc-text)" }}
          >
            {bestWeekPct}%
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-2 flex items-center gap-2">
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: "var(--twc-accent)" }}
        />
        <span className="text-[10px]" style={{ color: "var(--twc-muted)" }}>
          Weekly completion %
        </span>
      </div>

      {/* Chart */}
      <div className="flex justify-center py-2">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          className="block max-w-full"
          aria-label="Weekly completion percentage line chart"
        >
          {[1, 0.5, 0].map((p, idx) => {
            const yy = y(p);
            const lbl = `${Math.round(p * 100)}%`;
            return (
              <g key={idx}>
                <line
                  x1={PL}
                  y1={yy}
                  x2={W - PR}
                  y2={yy}
                  stroke="var(--twc-border)"
                  strokeWidth="1"
                />
                <text
                  x={PL - 6}
                  y={yy}
                  fontSize="10"
                  fill="var(--twc-muted)"
                  textAnchor="end"
                  dominantBaseline="central"
                >
                  {lbl}
                </text>
              </g>
            );
          })}
          <path
            d={path}
            fill="none"
            stroke="var(--twc-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {realSeries.map((pt, i) => (
            <circle
              key={pt.week + i}
              cx={xs[i]}
              cy={y(pt.pct)}
              r="2.5"
              fill="var(--twc-accent)"
            >
              <title>
                {pt.week}: {Math.round(pt.pct * 100)}%
              </title>
            </circle>
          ))}
        </svg>
      </div>
    </div>
  );
}
