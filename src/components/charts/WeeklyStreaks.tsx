// src/components/charts/WeeklyStreaks.tsx
"use client";

import { useMemo } from "react";

/**
 * Props: array of { id, name, streak }
 * Renders a compact, modern horizontal bar chart of current streaks per habit.
 */
type StreakDatum = { id: string; name: string; streak: number };

export default function WeeklyStreaks({ data }: { data: StreakDatum[] }) {
  // Sort by streak desc, then name
  const rows = useMemo(() => {
    return [...data].sort((a, b) => {
      if (b.streak !== a.streak) return b.streak - a.streak;
      return a.name.localeCompare(b.name);
    });
  }, [data]);

  const maxStreak = rows.reduce((m, r) => Math.max(m, r.streak), 0);
  const safeMax = Math.max(1, maxStreak); // avoid divide by zero

  // Layout constants
  const rowHeight = 36;
  const nameColWidth = 220; // keeps names aligned
  const rightPad = 40; // room for value labels
  const innerPad = 8; // gap between name col and chart

  // ⬇️ More breathing room above the chart so labels never clip
  const topPad = 28;
  const bottomPad = 14;

  const width = 560; // overall chart width (looks great in a Card)
  const chartWidth = width - nameColWidth - rightPad - innerPad;
  const height = topPad + bottomPad + rows.length * rowHeight;

  return (
    <div className="w-full overflow-x-auto">
      <div className="mx-auto pt-10" style={{ maxWidth: width }}>
        {rows.length === 0 ? (
          <div className="text-sm text-gray-500">No habits yet.</div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            height={height}
            className="block"
            role="img"
            aria-label="Current streak by habit (horizontal bars)"
          >
            {/* subtle background */}
            <rect
              x="0"
              y="0"
              width={width}
              height={height}
              fill="white"
              rx="8"
            />

            {/* rows */}
            {rows.map((r, idx) => {
              const y = topPad + idx * rowHeight;
              const trackH = 10;
              const barH = 15; // your change kept
              const trackY = (rowHeight - trackH) / 2;
              const barY = (rowHeight - barH) / 2;
              const barW = Math.round((r.streak / safeMax) * chartWidth);

              return (
                <g key={r.id} transform={`translate(0, ${y})`}>
                  {/* name cell */}
                  <text
                    x={12}
                    y={rowHeight / 2}
                    fontSize="12"
                    fill="#111827"
                    dominantBaseline="middle"
                  >
                    {r.name}
                  </text>

                  {/* baseline track */}
                  <rect
                    x={nameColWidth + innerPad}
                    y={trackY}
                    width={chartWidth}
                    height={trackH}
                    rx={6}
                    fill="#f3f4f6"
                  />

                  {/* value bar */}
                  <rect
                    x={nameColWidth + innerPad}
                    y={barY}
                    width={barW}
                    height={barH}
                    rx={6}
                    className="fill-emerald-500"
                  />

                  {/* value label */}
                  <text
                    x={nameColWidth + innerPad + barW + 8}
                    y={rowHeight / 2}
                    fontSize="12"
                    fill="#374151"
                    dominantBaseline="middle"
                  >
                    {r.streak} {r.streak === 1 ? "day" : "days"}
                  </text>

                  {/* row divider */}
                  <line
                    x1={0}
                    x2={width}
                    y1={rowHeight - 0.5}
                    y2={rowHeight - 0.5}
                    stroke="#f3f4f6"
                  />
                </g>
              );
            })}

            {/* X-axis ticks (0, 25%, 50%, 75%, max) — labels are now safely INSIDE */}
            {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
              const x = nameColWidth + innerPad + Math.round(p * chartWidth);
              const label =
                p === 1 ? `${safeMax}` : `${Math.round(p * safeMax)}`;
              return (
                <g key={i}>
                  <line
                    x1={x}
                    y1={topPad}
                    x2={x}
                    y2={height - bottomPad}
                    stroke="#f5f5f5"
                  />
                  <text
                    x={x}
                    y={topPad - 10} // always ≥ 0 thanks to bigger topPad
                    fontSize="10"
                    fill="#6b7280"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
}
