"use client";

type Streak = { id: string; name: string; streak: number };

/**
 * Pill row per habit (7 slots). If streak > 7, we show a compact "+N" badge.
 */
export default function HabitStreakPills({ data }: { data: Streak[] }) {
  return (
    <div className="flex flex-col gap-3">
      {data.map((d) => {
        const full = Math.min(7, d.streak);
        const extra = Math.max(0, d.streak - 7);

        return (
          <div key={d.id} className="flex items-center gap-3">
            <div
              className="w-28 shrink-0 truncate text-sm"
              style={{ color: "var(--twc-text)" }}
            >
              {d.name}
            </div>

            <div className="flex items-center gap-1">
              {Array.from({ length: 7 }).map((_, i) => {
                const active = i < full;
                return (
                  <span
                    key={i}
                    aria-hidden
                    className="h-3 w-6 rounded-full"
                    style={{
                      backgroundColor: active
                        ? "var(--twc-accent)"
                        : "color-mix(in oklab, var(--twc-text) 12%, transparent)",
                      transition: "background-color 200ms linear",
                    }}
                  />
                );
              })}
            </div>

            <div className="min-w-[2.5rem] text-right">
              {extra > 0 && (
                <span
                  className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[11px] tabular-nums"
                  style={{
                    backgroundColor:
                      "color-mix(in oklab, var(--twc-text) 10%, transparent)",
                    color: "var(--twc-text)",
                  }}
                  title={`${extra} more`}
                >
                  +{extra}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
