"use client";

import { useEffect, useMemo, useState } from "react";

type WeeklyPoint = { week: string; pct: number }; // pct in 0..1
type HistoryPayload = {
  id: string;
  name: string;
  series: WeeklyPoint[]; // ascending by week
  countWeeks: number;
};

// ISO week key like "2025-W09"
function isoWeekKey(d = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((+date - +yearStart) / 86400000 + 1) / 7);
  const weekStr = String(weekNo).padStart(2, "0");
  return `${date.getUTCFullYear()}-W${weekStr}`;
}

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
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const series = data?.series ?? [];
  const n = series.length;

  // chart sizing
  const H = 128;
  const PL = 38;
  const PR = 16;
  const PT = 26;
  const PB = 26;
  const innerH = H - PT - PB;

  const step = 18;
  const W = Math.max(360, PL + PR + Math.max(0, n - 1) * step);

  const y = (pct: number) => PT + (1 - pct) * innerH;

  const xs = useMemo(() => {
    if (n <= 1) return [PL];
    return Array.from(
      { length: n },
      (_, i) => PL + i * ((W - PL - PR) / (n - 1))
    );
  }, [n, W]);

  const path = useMemo(() => {
    if (n === 0) return "";
    const parts: string[] = [];
    series.forEach((pt, i) => {
      const xi = xs[i];
      const yi = y(pt.pct);
      parts.push(i === 0 ? `M ${xi} ${yi}` : `L ${xi} ${yi}`);
    });
    return parts.join(" ");
  }, [series, xs]);

  const currentKey = isoWeekKey();
  const lastIdx = n >= 2 && series[n - 1].week === currentKey ? n - 2 : n - 1;

  const lastWeekPct = lastIdx >= 0 ? Math.round(series[lastIdx].pct * 100) : 0;
  const windowCount = Math.min(8, n);
  const avgPct =
    windowCount > 0
      ? Math.round(
          (series.slice(n - windowCount).reduce((s, p) => s + p.pct, 0) /
            windowCount) *
            100
        )
      : 0;
  const bestWeekPct = n
    ? Math.round(Math.max(...series.map((p) => p.pct)) * 100)
    : 0;

  if (loading) {
    return (
      <div
        className="rounded-md px-2 py-1.5 text-[11px]"
        style={{
          border: "1px solid var(--twc-border)",
          backgroundColor:
            "color-mix(in oklab, var(--twc-bg) 85%, transparent)",
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
        className="rounded-md px-2 py-1.5 text-[11px]"
        style={{
          border: "1px solid var(--twc-border)",
          backgroundColor:
            "color-mix(in oklab, var(--twc-bg) 85%, transparent)",
          color: "var(--twc-danger)",
        }}
      >
        {err}
      </div>
    );
  }
  if (!n) {
    return (
      <div
        className="rounded-md px-2 py-1.5 text-[11px]"
        style={{
          border: "1px solid var(--twc-border)",
          backgroundColor:
            "color-mix(in oklab, var(--twc-bg) 85%, transparent)",
          color: "var(--twc-muted)",
        }}
      >
        No history yet.
      </div>
    );
  }

  return (
    <div
      className="rounded-md px-3 py-4"
      style={{
        border: "1px solid var(--twc-border)",
        backgroundColor: "color-mix(in oklab, var(--twc-bg) 85%, transparent)",
      }}
    >
      {/* header */}
      <div className="mb-3 flex items-center justify-between">
        <div
          className="text-[11px] font-medium"
          style={{ color: "var(--twc-text)" }}
        >
          History
        </div>
        <div className="text-[10px]" style={{ color: "var(--twc-muted)" }}>
          {n} {n === 1 ? "week" : "weeks"}
        </div>
      </div>

      {/* stats row */}
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

      {/* legend */}
      <div className="mb-2 flex items-center gap-2">
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: "var(--twc-accent)" }}
        />
        <span className="text-[10px]" style={{ color: "var(--twc-muted)" }}>
          Weekly completion %
        </span>
      </div>

      {/* chart */}
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

          <line
            x1={PL}
            y1={y(0)}
            x2={W - PR}
            y2={y(0)}
            stroke="var(--twc-border)"
            strokeWidth="1"
          />

          <path
            d={path}
            fill="none"
            stroke="var(--twc-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {series.map((pt, i) => (
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
