"use client";

type StreakDatum = { id: string; name: string; streak: number };

export default function HabitStreakBars({ data }: { data: StreakDatum[] }) {
  const max = Math.max(1, ...data.map((d) => d.streak));

  return (
    <div className="w-full">
      {/* Column headers */}
      <div className="grid grid-cols-[minmax(140px,1fr)_5fr_auto] gap-3 mb-4 text-xs font-medium tracking-wide text-[color-mix(in_oklab,var(--twc-text)_65%,transparent)]">
        <div>Habit</div>
        <div></div>
        <div className="text-right">Streak</div>
      </div>

      <ul className="space-y-2">
        {data.map((d) => {
          const pct = (d.streak / max) * 100;

          return (
            <li
              key={d.id}
              className="grid items-center gap-3"
              style={{
                gridTemplateColumns: "minmax(140px,1fr) 5fr auto",
              }}
            >
              {/* Habit name */}
              <div
                className="truncate text-sm"
                style={{ color: "var(--twc-text)" }}
                title={d.name}
              >
                {d.name}
              </div>

              {/* Bar */}
              <div
                className="relative h-3 rounded-full overflow-hidden"
                aria-label={`${d.name} streak length`}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-valuenow={d.streak}
                role="progressbar"
                style={{
                  background:
                    "color-mix(in oklab, var(--twc-text) 6%, var(--twc-surface))",
                  boxShadow: "inset 0 0 0 1px var(--twc-border)",
                }}
              >
                <div
                  className="h-full"
                  style={{
                    width: `${pct}%`,
                    background: "var(--twc-accent)",
                    transition: "width 260ms ease",
                  }}
                />
              </div>

              {/* Value */}
              <div
                className="text-xs tabular-nums text-right"
                style={{
                  color:
                    "color-mix(in oklab, var(--twc-text) 62%, transparent)",
                  minWidth: 24,
                }}
              >
                {d.streak}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
