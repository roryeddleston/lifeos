// src/app/habits/page.tsx
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
      label: d.toLocaleDateString("en-GB", { weekday: "short" }), // Mon, Tue…
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
    <div className="p-6 space-y-6">
      {/* 1) Heading */}
      <div className="px-4 pt-4">
        <h2 className="text-xl font-medium tracking-tight">Habits</h2>
      </div>

      {/* 2) Charts/Insights */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Completion Summary */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-900">This Week</h3>
          <p className="mt-1 text-sm text-gray-600">
            Overall completion across all habits
          </p>
          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full bg-emerald-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-600">
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
          <h3 className="text-sm font-medium text-gray-900">Streaks</h3>
          <p className="mt-1 text-sm text-gray-600">
            Best current and best 7-day streaks
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-200 p-3">
              <div className="text-xs text-gray-600">Current (max)</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">
                {currentStreakMax} {currentStreakMax === 1 ? "day" : "days"}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <div className="text-xs text-gray-600">Best (last 7 days)</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">
                {bestStreakMax} {bestStreakMax === 1 ? "day" : "days"}
              </div>
            </div>
          </div>
        </Card>

        {/* Mini Bar Chart */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-900">Last 7 Days</h3>
          <p className="mt-1 text-sm text-gray-600">
            Daily total completions across all habits
          </p>
          <div className="mt-4">
            <svg
              viewBox={`0 0 ${7 * (barWidth + gap) - gap} ${chartHeight + 5}`}
              className="w-full"
            >
              {/* guide lines */}
              <line
                x1="0"
                y1={chartHeight}
                x2={7 * (barWidth + gap) - gap}
                y2={chartHeight}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1={Math.round(chartHeight * 0.5)}
                x2={7 * (barWidth + gap) - gap}
                y2={Math.round(chartHeight * 0.5)}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1={Math.round(chartHeight * 0.15)}
                x2={7 * (barWidth + gap) - gap}
                y2={Math.round(chartHeight * 0.15)}
                stroke="#f8fafc"
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
                    className="fill-emerald-500"
                  />
                );
              })}
            </svg>
            <div className="mt-2 grid grid-cols-7 text-center text-xs text-gray-600">
              {days.map((d) => (
                <span key={d.iso}>{d.label}</span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* 3) Weekday header + List (kept together for perfect alignment) */}
      <Card className="border-0 !shadow-none">
        {/* Weekday header (must match HabitCard grid exactly) */}
        <div className="px-4 pt-4 pb-2 grid grid-cols-[minmax(0,1fr)_17rem_2rem] items-end gap-4">
          <div />
          <div className="w-[17rem]">
            <div className="grid grid-cols-7 gap-2">
              {days.map((d) => (
                <div
                  key={d.iso}
                  className={`w-8 h-5 text-[11px] leading-5 text-center ${
                    d.isToday ? "text-gray-900 font-medium" : "text-gray-500"
                  }`}
                  aria-label={d.iso}
                  title={d.iso}
                >
                  {d.label}
                </div>
              ))}
            </div>
          </div>
          <div className="w-8" aria-hidden />
        </div>

        {/* List */}
        {view.length === 0 ? (
          <div className="px-4 py-16">
            <div className="mx-auto max-w-md rounded-lg border bg-white/70 px-6 py-8 text-center">
              <h3 className="text-sm font-medium text-gray-900">
                No habits yet
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Add your first habit below to start building streaks.
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {view.map((h) => (
              <li key={h.id} className="px-4 py-3">
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
