"use client";

import { useEffect, useState } from "react";

export type ProgressFillProps = {
  /** Target percent 0..100 */
  toPercent: number;
  /** Duration in ms */
  duration?: number;
  /** Optional delay in ms */
  delay?: number;
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(!!mql?.matches);
    onChange();
    mql?.addEventListener?.("change", onChange);
    return () => mql?.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

export default function ProgressFill({
  toPercent,
  duration = 900,
  delay = 0,
}: ProgressFillProps) {
  const reduced = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reduced) {
      // no animation — set ready so we show final width immediately
      setReady(true);
      return;
    }
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [reduced]);

  const pct = Math.max(0, Math.min(100, toPercent));
  const scaleX = reduced ? 1 : ready ? pct / 100 : 0;

  return (
    <div
      className="h-2 rounded-full origin-left"
      style={{
        width: `${pct}%`, // final width for layout
        transform: `scaleX(${scaleX})`,
        transition: reduced
          ? "none"
          : `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        backgroundColor: "var(--twc-accent)",
      }}
    />
  );
}
