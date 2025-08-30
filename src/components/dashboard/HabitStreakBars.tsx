"use client";

import { useEffect, useState } from "react";

type Row = { name: string; streak: number };

function capitalizeFirstChar(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function HabitStreakBars({ data }: { data: Row[] }) {
  const sorted = [...data].sort((a, b) => b.streak - a.streak);
  const max = Math.max(1, ...sorted.map((d) => d.streak));

  // Animate widths from 0% -> target after first paint
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    setReduced(!!mql?.matches);
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="space-y-3">
      {/* Column headers */}
      <div
        className="grid grid-cols-[minmax(0,1fr)_5rem] gap-4 text-xs"
        style={{ color: "var(--twc-muted)" }}
      >
        <div>Habit</div>
        <div className="text-right">Streak</div>
      </div>

      {/* Rows */}
      <ul className="space-y-3">
        {sorted.map((row, idx) => {
          const pct = Math.round((row.streak / max) * 100);
          const targetWidth = `${pct}%`;
          const displayName = capitalizeFirstChar(row.name);

          return (
            <li key={`${row.name}-${idx}`} className="space-y-1">
              {/* Name + Streak inline */}
              <div className="grid grid-cols-[minmax(0,1fr)_5rem] gap-4 items-center">
                <div
                  className="truncate text-sm"
                  style={{ color: "var(--twc-text)" }}
                  title={row.name}
                >
                  {displayName}
                </div>
                <div
                  className="text-right tabular-nums text-sm font-medium"
                  style={{ color: "var(--twc-text)" }}
                >
                  {row.streak}
                </div>
              </div>

              {/* Bar underneath spanning full width */}
              <div
                className="h-2 w-full rounded-full"
                style={{
                  backgroundColor:
                    "color-mix(in oklab, var(--twc-text) 8%, var(--twc-surface))",
                }}
              >
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: reduced ? targetWidth : ready ? targetWidth : "0%",
                    backgroundColor: "var(--twc-accent)",
                    transition: reduced
                      ? "none"
                      : "width 2000ms cubic-bezier(0.22, 1, 0.36, 1)",
                    transitionDelay: reduced ? "0ms" : `${idx * 150}ms`,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
