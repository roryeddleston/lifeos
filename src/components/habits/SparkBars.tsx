"use client";

import { useEffect, useState } from "react";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(!!mql?.matches);
    update();
    mql?.addEventListener?.("change", update);
    return () => mql?.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

export default function SparkBars({
  counts,
  height,
  barWidth = 12,
  gap = 8,
}: {
  counts: number[];
  height: number; // chart area height (e.g. 35)
  barWidth?: number; // default 12
  gap?: number; // default 8
}) {
  const reduced = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // kick animation on first paint
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const max = Math.max(1, ...counts);
  const chartWidth = counts.length * (barWidth + gap) - gap;

  return (
    <svg
      viewBox={`0 0 ${chartWidth} ${height + 5}`}
      className="w-full block"
      aria-label="Completions over the last 7 days"
    >
      {/* guide lines */}
      <line
        x1="0"
        y1={height}
        x2={chartWidth}
        y2={height}
        stroke="color-mix(in oklab, var(--twc-text) 8%, transparent)"
        strokeWidth="1"
      />
      <line
        x1="0"
        y1={Math.round(height * 0.5)}
        x2={chartWidth}
        y2={Math.round(height * 0.5)}
        stroke="color-mix(in oklab, var(--twc-text) 6%, transparent)"
        strokeWidth="1"
      />
      <line
        x1="0"
        y1={Math.round(height * 0.15)}
        x2={chartWidth}
        y2={Math.round(height * 0.15)}
        stroke="color-mix(in oklab, var(--twc-text) 4%, transparent)"
        strokeWidth="1"
      />

      {counts.map((c, i) => {
        // scale target as a fraction of full chart height
        const scaleYTarget = max > 0 ? Math.max(0, Math.min(1, c / max)) : 0;
        const x = i * (barWidth + gap);

        return (
          <g
            key={i}
            transform={`translate(${x}, 0)`}
            style={{
              transformOrigin: `${x + barWidth / 2}px ${height}px`,
            }}
          >
            <rect
              x={0}
              y={height - height}
              width={barWidth}
              height={height}
              rx={2}
              fill="var(--twc-accent)"
              style={{
                // animate the scale from 0 -> target, pinned to bottom
                transformOrigin: `0 ${height}px`,
                transform: `scaleY(${
                  reduced ? scaleYTarget : ready ? scaleYTarget : 0
                })`,
                transition: reduced
                  ? "none"
                  : "transform 800ms cubic-bezier(0.22, 1, 0.36, 1)",
                transitionDelay: reduced ? "0ms" : `${i * 90}ms`,
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}
