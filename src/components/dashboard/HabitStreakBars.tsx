type Row = { name: string; streak: number };

export default function HabitStreakBars({ data }: { data: Row[] }) {
  const sorted = [...data].sort((a, b) => b.streak - a.streak);
  const max = Math.max(1, ...sorted.map((d) => d.streak));

  return (
    <div className="space-y-3">
      {/* Column headers */}
      <div
        className="px-1 grid grid-cols-[minmax(0,1fr)_5rem] gap-3 text-xs"
        style={{ color: "var(--twc-muted)" }}
      >
        <div>Habit</div>
        <div className="text-right">Streak</div>
      </div>

      {/* Rows */}
      <ul className="space-y-2">
        {sorted.map((row, idx) => {
          const pct = Math.round((row.streak / max) * 100);
          return (
            <li
              key={`${row.name}-${idx}`}
              className="grid grid-cols-[minmax(0,1fr)_5rem] items-center gap-3"
            >
              <div className="min-w-0">
                <div
                  className="h-2 w-full rounded-full"
                  style={{
                    backgroundColor:
                      "color-mix(in oklab, var(--twc-text) 8%, var(--twc-surface))",
                  }}
                  aria-label={`${row.name} streak ${row.streak}`}
                >
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: "var(--twc-accent)",
                    }}
                  />
                </div>
                <div
                  className="mt-1 truncate text-xs"
                  style={{ color: "var(--twc-text)" }}
                  title={row.name}
                >
                  {row.name}
                </div>
              </div>

              <div
                className="text-right tabular-nums text-sm font-medium"
                style={{ color: "var(--twc-text)" }}
              >
                {row.streak}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
