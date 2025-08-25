// src/components/habits/HabitHistory.tsx
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
  // Thursday in current week decides the year.
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

  // fetch once
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

  // ---- derived values (keep hook order stable) ----
  const series = data?.series ?? [];
  const n = series.length;

  // chart sizing – compact & professional
  const H = 128; // svg height
  const PL = 32; // left padding (wider to clear labels)
  const PR = 16; // right padding
  const PT = 16; // top padding
  const PB = 16; // bottom padding
  const innerH = H - PT - PB;

  const step = 18; // spacing per point
  const W = Math.max(520, PL + PR + Math.max(0, n - 1) * step);

  // y from pct (0..1)
  const y = (pct: number) => PT + (1 - pct) * innerH;

  // x positions
  const xs = useMemo(() => {
    if (n <= 1) return [PL];
    return Array.from(
      { length: n },
      (_, i) => PL + i * ((W - PL - PR) / (n - 1))
    );
  }, [n, W]);

  // line path
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

  // determine the “last week” index (skip current week if present)
  const currentKey = isoWeekKey();
  const lastIdx = n >= 2 && series[n - 1].week === currentKey ? n - 2 : n - 1;

  // stats
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

  // ---- early states (after hooks) ----
  if (loading) {
    return (
      <div className="rounded-md border border-gray-200 bg-white/70 px-2 py-1.5 text-[11px] text-gray-600">
        Loading history…
      </div>
    );
  }
  if (err) {
    return (
      <div className="rounded-md border border-gray-200 bg-white/70 px-2 py-1.5 text-[11px] text-red-600">
        {err}
      </div>
    );
  }
  if (!n) {
    return (
      <div className="rounded-md border border-gray-200 bg-white/70 px-2 py-1.5 text-[11px] text-gray-500">
        No history yet.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white/70 px-3 py-2">
      {/* header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[11px] font-medium text-gray-900">History</div>
        <div className="text-[10px] text-gray-500">
          {n} {n === 1 ? "week" : "weeks"}
        </div>
      </div>

      {/* stats row */}
      <div className="mb-2 grid grid-cols-3 gap-2">
        <div
          className="rounded-[8px] border border-gray-200 px-2 py-1.5"
          title="Completion in the most recent completed week"
        >
          <div className="text-[10px] text-gray-600">Last week</div>
          <div className="text-sm font-semibold text-gray-900">
            {lastWeekPct}%
          </div>
        </div>
        <div
          className="rounded-[8px] border border-gray-200 px-2 py-1.5"
          title="Average over the last 8 completed weeks (or fewer if not available)"
        >
          <div className="text-[10px] text-gray-600">Avg (8w)</div>
          <div className="text-sm font-semibold text-gray-900">{avgPct}%</div>
        </div>
        <div
          className="rounded-[8px] border border-gray-200 px-2 py-1.5"
          title="Best single week across the shown period"
        >
          <div className="text-[10px] text-gray-600">Best week</div>
          <div className="text-sm font-semibold text-gray-900">
            {bestWeekPct}%
          </div>
        </div>
      </div>

      {/* tiny legend */}
      <div className="mb-1 flex items-center gap-2">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span className="text-[10px] text-gray-600">Weekly completion %</span>
      </div>

      {/* chart */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          className="block max-w-full"
          aria-label="Weekly completion percentage line chart"
        >
          {/* Y gridlines & labels at 100 / 50 / 0 */}
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
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                {/* Right-aligned labels tucked just inside plot area */}
                <text
                  x={PL - 6}
                  y={yy}
                  fontSize="10"
                  fill="#6b7280"
                  textAnchor="end"
                  dominantBaseline="central"
                >
                  {lbl}
                </text>
              </g>
            );
          })}

          {/* X baseline */}
          <line
            x1={PL}
            y1={y(0)}
            x2={W - PR}
            y2={y(0)}
            stroke="#e5e7eb"
            strokeWidth="1"
          />

          {/* line */}
          <path
            d={path}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* points */}
          {series.map((pt, i) => (
            <circle
              key={pt.week + i}
              cx={xs[i]}
              cy={y(pt.pct)}
              r="2.5"
              fill="#10b981"
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
