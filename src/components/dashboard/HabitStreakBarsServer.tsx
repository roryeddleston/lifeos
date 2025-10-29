// src/components/dashboard/HabitStreakBarsServer.tsx
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Card from "@/components/cards/Card";

function startOfDayUTC(d: Date) {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}
function addDaysUTC(d: Date, n: number) {
  const c = new Date(d);
  c.setUTCDate(c.getUTCDate() + n);
  return c;
}

export default async function HabitStreakBarsServer() {
  const { userId } = await auth();
  if (!userId) return null;

  const today = startOfDayUTC(new Date());
  const start = addDaysUTC(today, -6);
  const end = addDaysUTC(today, 1);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDaysUTC(start, i);
    return {
      iso: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-GB", {
        weekday: "short",
        timeZone: "UTC",
      }),
    };
  });

  // One query -> aggregate to daily counts (avoids 7x pooler hits)
  let counts = new Array(7).fill(0);
  try {
    const records = await prisma.habitRecord.findMany({
      where: {
        completed: true,
        date: { gte: start, lt: end },
        habit: { userId },
      },
      select: { date: true },
    });
    const byIso = new Map<string, number>();
    for (const r of records) {
      const iso = r.date.toISOString().slice(0, 10);
      byIso.set(iso, (byIso.get(iso) ?? 0) + 1);
    }
    counts = days.map((d) => byIso.get(d.iso) ?? 0);
  } catch {
    counts = new Array(7).fill(0);
  }

  // Match the SparkBars style used on the Habits page
  const height = 35;
  const barWidth = 12;
  const gap = 8;
  const chartWidth = counts.length * (barWidth + gap) - gap;
  const max = Math.max(1, ...counts);
  const toH = (c: number) => Math.round((c / max) * height);

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium" style={{ color: "var(--twc-text)" }}>
        Last 7 Days
      </h3>
      <p className="mt-1 text-sm" style={{ color: "var(--twc-muted)" }}>
        Daily total completions across all habits
      </p>

      <div className="mt-4">
        <svg viewBox={`0 0 ${chartWidth} ${height + 5}`} className="w-full">
          {/* guide lines — same visual as SparkBars */}
          <line
            x1="0"
            y1={height}
            x2={chartWidth}
            y2={height}
            stroke="var(--twc-border)"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1={Math.round(height * 0.5)}
            x2={chartWidth}
            y2={Math.round(height * 0.5)}
            stroke="color-mix(in oklab, var(--twc-text) 6%, var(--twc-surface))"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1={Math.round(height * 0.15)}
            x2={chartWidth}
            y2={Math.round(height * 0.15)}
            stroke="color-mix(in oklab, var(--twc-text) 3%, var(--twc-surface))"
            strokeWidth="1"
          />

          {counts.map((c, i) => {
            const x = i * (barWidth + gap);
            const h = toH(c);
            const y = height - h;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={barWidth}
                height={h}
                rx={2}
                fill="var(--twc-accent)"
              />
            );
          })}
        </svg>

        <div
          className="mt-2 grid grid-cols-7 text-center text-xs"
          style={{ color: "var(--twc-muted)" }}
        >
          {days.map((d) => (
            <span key={d.iso}>{d.label}</span>
          ))}
        </div>
      </div>
    </Card>
  );
}
