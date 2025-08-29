import { prisma } from "@/lib/prisma";
import Card from "@/components/cards/Card";
import HabitCard from "@/components/habits/HabitCard";
import QuickAddHabit from "@/components/habits/QuickAddHabit";

export const dynamic = "force-dynamic";

function startOfDayUTC(d = new Date()) {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}
function addDays(d: Date, n: number) {
  const copy = new Date(d);
  copy.setUTCDate(copy.getUTCDate() + n);
  return copy;
}
function toISODate(d: Date) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

// helper: best streak inside a boolean array
function maxRun(arr: boolean[]) {
  let best = 0;
  let curr = 0;
  for (const v of arr) {
    if (v) {
      curr++;
      best = Math.max(best, curr);
    } else {
      curr = 0;
    }
  }
  return best;
}

export default async function HabitsPage() {
  const today = startOfDayUTC();
  const start = addDays(today, -6); // last 7 days
  const end = addDays(today, 1); // < end

  const habits = await prisma.habit.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      records: {
        where: { date: { gte: start, lt: end } },
        select: { date: true, completed: true },
      },
    },
  });

  // Shared 7-day window (oldest -> newest)
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(start, i);
    return {
      iso: toISODate(d),
      // UTC to avoid any server/client timezone mismatch
      label: d.toLocaleDateString("en-GB", {
        weekday: "short",
        timeZone: "UTC",
      }),
      isToday: d.getTime() === today.getTime(),
    };
  });

  const view = habits.map((h) => {
    const map = new Map<string, boolean>();
    for (const r of h.records) map.set(toISODate(r.date), !!r.completed);

    const timeline = days.map((d) => ({
      iso: d.iso,
      completed: map.get(d.iso) ?? false,
    }));

    // compute current streak (from newest back within this 7-day window)
    let streak = 0;
    for (let i = timeline.length - 1; i >= 0; i--) {
      if (timeline[i].completed) streak++;
      else break;
    }
    return { id: h.id, name: h.name, timeline, streak };
  });

  // ---------- Live insights (based on last 7 days) ----------
  const totalCells = view.length * days.length;
  const completedCells = view.reduce(
    (sum, h) => sum + h.timeline.filter((t) => t.completed).length,
    0
  );
  const completionPct =
    totalCells > 0 ? Math.round((completedCells / totalCells) * 100) : 0;

  const currentStreakMax = view.reduce((m, h) => Math.max(m, h.streak), 0);
  const bestStreakMax = view.reduce(
    (m, h) => Math.max(m, maxRun(h.timeline.map((t) => t.completed))),
    0
  );

  const perDayCounts = days.map((_, idx) =>
    view.reduce((sum, h) => sum + (h.timeline[idx]?.completed ? 1 : 0), 0)
  );
  const chartMax = Math.max(1, ...perDayCounts);
  const chartHeight = 35;
  const barWidth = 12;
  const gap = 8;

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="px-4 pt-4">
        <h2 className="text-2xl font-semibold tracking-tight">Habits</h2>
      </div>

      {/* Charts/Insights */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Completion Summary */}
        <Card className="p-4">
          <h3 className="text-sm font-medium">This Week</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--twc-muted)" }}>
            Overall completion across all habits
          </p>
          <div className="mt-4">
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
                  width: `${completionPct}%`,
                  backgroundColor: "var(--twc-accent)",
                }}
              />
            </div>
            <div className="mt-2 text-xs" style={{ color: "var(--twc-muted)" }}>
              {completionPct}% complete
              {totalCells > 0 && (
                <>
                  {" "}
                  ({completedCells}/{totalCells} checks)
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Streaks */}
        <Card className="p-4">
          <h3 className="text-sm font-medium">Streaks</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--twc-muted)" }}>
            Best current and best 7-day streaks
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div
              className="rounded-lg p-3"
              style={{
                border: "1px solid var(--twc-border)",
                backgroundColor: "var(--twc-surface)",
              }}
            >
              <div className="text-xs" style={{ color: "var(--twc-muted)" }}>
                Current (max)
              </div>
              <div className="mt-1 text-lg font-semibold">
                {currentStreakMax} {currentStreakMax === 1 ? "day" : "days"}
              </div>
            </div>
            <div
              className="rounded-lg p-3"
              style={{
                border: "1px solid var(--twc-border)",
                backgroundColor: "var(--twc-surface)",
              }}
            >
              <div className="text-xs" style={{ color: "var(--twc-muted)" }}>
                Best (last 7 days)
              </div>
              <div className="mt-1 text-lg font-semibold">
                {bestStreakMax} {bestStreakMax === 1 ? "day" : "days"}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium">Last 7 Days</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--twc-muted)" }}>
            Daily total completions across all habits
          </p>
          <div className="mt-4">
            <svg
              viewBox={`0 0 ${7 * (barWidth + gap) - gap} ${chartHeight + 5}`}
              className="w-full block"
            >
              {/* guide lines */}
              <line
                x1="0"
                y1={chartHeight}
                x2={7 * (barWidth + gap) - gap}
                y2={chartHeight}
                stroke="color-mix(in oklab, var(--twc-text) 8%, transparent)"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1={Math.round(chartHeight * 0.5)}
                x2={7 * (barWidth + gap) - gap}
                y2={Math.round(chartHeight * 0.5)}
                stroke="color-mix(in oklab, var(--twc-text) 6%, transparent)"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1={Math.round(chartHeight * 0.15)}
                x2={7 * (barWidth + gap) - gap}
                y2={Math.round(chartHeight * 0.15)}
                stroke="color-mix(in oklab, var(--twc-text) 4%, transparent)"
                strokeWidth="1"
              />
              {perDayCounts.map((count, i) => {
                const height =
                  chartMax > 0
                    ? Math.round((count / chartMax) * chartHeight)
                    : 0;
                const x = i * (barWidth + gap);
                const y = chartHeight - height;
                return (
                  <rect
                    key={i}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={height}
                    rx="2"
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
      </div>

      <Card className="p-0">
        <div className="px-4 pt-4 pb-2 grid grid-cols-[minmax(0,1fr)_17rem_2rem] items-end gap-4">
          <div
            className="text-xs font-medium"
            style={{ color: "var(--twc-muted)" }}
          >
            Habits
          </div>

          <div className="w-[17rem]">
            <div className="grid grid-cols-7 gap-2">
              {days.map((d) => (
                <div
                  key={d.iso}
                  className={`w-8 h-5 text-[11px] leading-5 text-center ${
                    d.isToday ? "font-medium" : ""
                  }`}
                  aria-label={d.iso}
                  title={d.iso}
                  style={{
                    color: d.isToday
                      ? "var(--twc-text)"
                      : "color-mix(in oklab, var(--twc-text) 45%, transparent)",
                  }}
                >
                  {d.label}
                </div>
              ))}
            </div>
          </div>
          <div className="w-8" aria-hidden />
        </div>

        {view.length === 0 ? (
          <div className="px-4 py-16">
            <div
              className="mx-auto max-w-md rounded-lg px-6 py-8 text-center"
              style={{
                border: "1px solid var(--twc-border)",
                background:
                  "color-mix(in oklab, var(--twc-bg) 85%, transparent)",
              }}
            >
              <h3 className="text-sm font-medium">No habits yet</h3>
              <p className="mt-2 text-sm" style={{ color: "var(--twc-muted)" }}>
                Add your first habit below to start building streaks.
              </p>
            </div>
          </div>
        ) : (
          <ul>
            {view.map((h, i) => (
              <li
                key={h.id}
                className="px-4 py-3"
                style={{
                  borderBottom:
                    i === view.length - 1
                      ? "0"
                      : "1px solid color-mix(in oklab, var(--twc-border) 40%, transparent)",
                }}
              >
                <HabitCard habit={h} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <QuickAddHabit />
    </div>
  );
}
