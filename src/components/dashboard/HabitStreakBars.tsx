type Row = { name: string; streak: number };

export default function HabitStreakBars({ data }: { data: Row[] }) {
  const sorted = [...data].sort((a, b) => b.streak - a.streak);
  const max = Math.max(1, ...sorted.map((d) => d.streak));

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
          return (
            <li key={`${row.name}-${idx}`} className="space-y-1">
              {/* Name + Streak inline */}
              <div className="grid grid-cols-[minmax(0,1fr)_5rem] gap-4 items-center">
                <div
                  className="truncate text-sm"
                  style={{ color: "var(--twc-text)" }}
                  title={row.name}
                >
                  {row.name}
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
                    width: `${pct}%`,
                    backgroundColor: "var(--twc-accent)",
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
