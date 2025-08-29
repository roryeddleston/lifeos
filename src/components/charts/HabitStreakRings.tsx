"use client";

type Streak = { id: string; name: string; streak: number };

/**
 * Responsive ring grid. Each ring scales with container.
 * Stroke progress = streak / max(streaks)
 */
export default function HabitStreakRings({ data }: { data: Streak[] }) {
  const max = Math.max(1, ...data.map((d) => d.streak));

  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
      }}
    >
      {data.map((d) => {
        const ratio = d.streak / max;
        const size = 92;
        const stroke = 8;
        const r = (size - stroke) / 2;
        const c = 2 * Math.PI * r;
        const dash = Math.max(0, Math.min(c, c * ratio));

        return (
          <div key={d.id} className="flex flex-col items-center">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              role="img"
              aria-label={`${d.name} streak ${d.streak}`}
            >
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="color-mix(in oklab, var(--twc-text) 10%, transparent)"
                strokeWidth={stroke}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="var(--twc-accent)"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${dash} ${c - dash}`}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{
                  transition:
                    "stroke-dasharray 380ms cubic-bezier(0.22,1,0.36,1)",
                  filter: "drop-shadow(0 0 0 transparent)",
                }}
              />
              <text
                x="50%"
                y="50%"
                dominantBaseline="central"
                textAnchor="middle"
                fontSize="14"
                style={{ fill: "var(--twc-text)" }}
              >
                {d.streak}
              </text>
            </svg>
            <div
              className="mt-2 max-w-[10rem] truncate text-sm text-center"
              style={{ color: "var(--twc-text)" }}
              title={d.name}
            >
              {d.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
