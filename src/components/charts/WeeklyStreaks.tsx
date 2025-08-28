"use client";

import { useMemo } from "react";

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

  // More breathing room above the chart so labels never clip
  const topPad = 28;
  const bottomPad = 14;

  const width = 560; // overall chart width (looks great in a Card)
  const chartWidth = width - nameColWidth - rightPad - innerPad;
  const height = topPad + bottomPad + rows.length * rowHeight;

  // Theme-aware colors
  const text = "var(--twc-text)";
  const muted = "color-mix(in oklab, var(--twc-text) 60%, transparent)";
  const extraMuted = "color-mix(in oklab, var(--twc-text) 45%, transparent)";
  const grid = "color-mix(in oklab, var(--twc-text) 10%, transparent)";
  const gridLight = "color-mix(in oklab, var(--twc-text) 6%, transparent)";
  const track = "color-mix(in oklab, var(--twc-text) 8%, var(--twc-surface))";
  const surface = "var(--twc-surface)";
  const border = "var(--twc-border)";
  const accent = "var(--twc-accent)"; // blue-green brand color 💙💚

  return (
    <div className="w-full overflow-x-auto">
      <div className="mx-auto pt-10" style={{ maxWidth: width }}>
        {rows.length === 0 ? (
          <div className="text-sm" style={{ color: muted }}>
            No habits yet.
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            height={height}
            className="block"
            role="img"
            aria-label="Current streak by habit (horizontal bars)"
          >
            {/* subtle background card-like surface */}
            <rect
              x="0"
              y="0"
              width={width}
              height={height}
              fill={surface}
              stroke={border}
              rx="8"
            />

            {/* rows */}
            {rows.map((r, idx) => {
              const y = topPad + idx * rowHeight;
              const trackH = 10;
              const barH = 15;
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
                    fill={text}
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
                    fill={track}
                  />

                  {/* value bar */}
                  <rect
                    x={nameColWidth + innerPad}
                    y={barY}
                    width={barW}
                    height={barH}
                    rx={6}
                    fill={accent}
                  />

                  {/* value label */}
                  <text
                    x={nameColWidth + innerPad + barW + 8}
                    y={rowHeight / 2}
                    fontSize="12"
                    fill={muted}
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
                    stroke={grid}
                  />
                </g>
              );
            })}

            {/* X-axis ticks (0, 25%, 50%, 75%, max) */}
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
                    stroke={gridLight}
                  />
                  <text
                    x={x}
                    y={topPad - 10}
                    fontSize="10"
                    fill={extraMuted}
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
