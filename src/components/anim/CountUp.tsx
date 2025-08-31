"use client";

import { useEffect, useRef, useState } from "react";

export type CountUpProps = {
  /** Final value to count up to */
  to: number;
  /** Duration in ms (default 1000) */
  duration?: number;
  /** Optional formatter for the animated value */
  format?: (v: number) => React.ReactNode;
  /** Optional render-prop; if provided, children receives the animated value */
  children?: (v: number) => React.ReactNode;
  /** Start value (default 0) */
  from?: number;
};

function easeOutCubic(p: number) {
  return 1 - Math.pow(1 - p, 3);
}

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

export default function CountUp({
  to,
  duration = 1000,
  format,
  children,
  from = 0,
}: CountUpProps) {
  const prefersReduced = usePrefersReducedMotion();
  const [value, setValue] = useState<number>(from);
  const startedRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    // Guard non-finite
    if (!Number.isFinite(to)) {
      setValue(to);
      return;
    }
    // Reduced motion or trivial duration -> jump
    if (prefersReduced || duration <= 0 || from === to) {
      setValue(to);
      return;
    }

    startedRef.current = null;

    const tick = (now: number) => {
      if (startedRef.current == null) startedRef.current = now;
      const elapsed = now - startedRef.current;
      const p = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(p);
      const current = from + (to - from) * eased;
      setValue(Math.round(current));
      if (p < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [to, duration, prefersReduced, from]);

  const rendered =
    typeof children === "function"
      ? children(value)
      : format
      ? format(value)
      : value;

  return <span className="tabular-nums">{rendered}</span>;
}
