// src/components/dashboard/HabitStreakBarsServer.tsx
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Card from "@/components/cards/Card";

function startOfDayUTC(d: Date) {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}

function startOfWeekUTC(d: Date) {
  const day = d.getUTCDay(); // 0..6
  const diff = (day + 6) % 7; // Monday = 0
  const start = new Date(d);
  start.setUTCDate(d.getUTCDate() - diff);
  return startOfDayUTC(start);
}

export default async function HabitStreakBarsServer() {
  const { userId } = await auth();
  if (!userId) return null;

  const today = startOfDayUTC(new Date());
  const starts = Array.from({ length: 4 }, (_, i) => {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i * 7);
    return startOfWeekUTC(d);
  }).reverse(); // oldest -> newest

  const endOf = (d: Date) => {
    const e = new Date(d);
    e.setUTCDate(d.getUTCDate() + 7);
    return e;
  };

  // Count total completed habit records per week
  const counts = await Promise.all(
    starts.map(async (weekStart) => {
      const weekEnd = endOf(weekStart);
      const c = await prisma.habitRecord.count({
        where: {
          habit: { userId },
          completed: true,
          date: { gte: weekStart, lt: weekEnd },
        },
      });
      return { weekStart, count: c };
    })
  );

  const max = Math.max(1, ...counts.map((c) => c.count));

  return (
    <Card className="p-4">
      <div
        className="mb-3 text-sm font-medium"
        style={{ color: "var(--twc-text)" }}
      >
        Weekly Habit Completions (4 weeks)
      </div>
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 440 120`}
          width="100%"
          height="120"
          role="img"
          aria-label="Weekly habit completions"
        >
          {counts.map((c, i) => {
            const x = 20 + i * 100;
            const h = Math.round((c.count / max) * 80);
            const y = 100 - h;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={60}
                  height={h}
                  rx={8}
                  style={{ fill: "var(--twc-accent)" }}
                />
                <text
                  x={x + 30}
                  y={110}
                  textAnchor="middle"
                  fontSize="10"
                  style={{ fill: "var(--twc-muted)" }}
                >
                  {c.weekStart.toISOString().slice(5, 10)}
                </text>
                <text
                  x={x + 30}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize="12"
                  className="tabular-nums"
                  style={{ fill: "var(--twc-text)" }}
                >
                  {c.count}
                </text>
              </g>
            );
          })}
          <line
            x1="10"
            y1="100"
            x2="430"
            y2="100"
            style={{
              stroke:
                "color-mix(in oklab, var(--twc-text) 12%, var(--twc-surface))",
              strokeWidth: 1,
            }}
          />
        </svg>
      </div>
    </Card>
  );
}
