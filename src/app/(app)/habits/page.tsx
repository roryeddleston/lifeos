import { auth } from "@clerk/nextjs/server";
import { unstable_cache } from "next/cache";
import Card from "@/components/cards/Card";
import HabitCard from "@/components/habits/HabitCard";
import QuickAddHabit from "@/components/habits/QuickAddHabit";
import StreakMetric from "@/components/habits/StreakMetric";
import SparkBars from "@/components/habits/SparkBars";
import { getHabitsForUserInRange } from "@/lib/habits";

export const runtime = "nodejs";

const getCachedHabitsForUserInRange = (
  userId: string,
  start: Date,
  end: Date
) =>
  unstable_cache(
    () => getHabitsForUserInRange(userId, start, end),
    ["habits-range", userId, start.toISOString(), end.toISOString()],
    {
      revalidate: 20,
    }
  )();

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

function toISODate(d: Date | string) {
  if (typeof d === "string") {
    // Assume ISO-like string and slice date portion
    return d.slice(0, 10);
  }
  const date = d instanceof Date ? d : new Date(d);
  return date.toISOString().slice(0, 10);
}

function maxRun(arr: boolean[]) {
  let best = 0,
    curr = 0;
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

type TimelineItem = { iso: string; completed: boolean };
type HabitView = {
  id: string;
  name: string;
  timeline: TimelineItem[];
  streak: number;
};

export default async function HabitsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const today = startOfDayUTC();
  const start = addDays(today, -6);
  const end = addDays(today, 1);

  const habits = await getCachedHabitsForUserInRange(userId, start, end);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(start, i);
    return {
      iso: toISODate(d),
      label: d.toLocaleDateString("en-GB", {
        weekday: "short",
        timeZone: "UTC",
      }),
      isToday: d.getTime() === today.getTime(),
    };
  });

  const view: HabitView[] = habits.map((h): HabitView => {
    const map = new Map<string, boolean>();
    for (const r of h.completions) {
      map.set(toISODate(r.date), !!r.completed);
    }

    const timeline: TimelineItem[] = days.map((d) => ({
      iso: d.iso,
      completed: map.get(d.iso) ?? false,
    }));

    let streak = 0;
    for (let i = timeline.length - 1; i >= 0; i--) {
      if (timeline[i].completed) streak++;
      else break;
    }

    return { id: h.id, name: h.name, timeline, streak };
  });

  const totalCells = view.length * days.length;
  const completedCells = view.reduce(
    (sum: number, h: HabitView) =>
      sum + h.timeline.filter((t: TimelineItem) => t.completed).length,
    0
  );

  const completionPct =
    totalCells > 0 ? Math.round((completedCells / totalCells) * 100) : 0;

  const currentStreakMax = view.reduce(
    (m: number, h: HabitView) => Math.max(m, h.streak),
    0
  );

  const bestStreakMax = view.reduce(
    (m: number, h: HabitView) =>
      Math.max(m, maxRun(h.timeline.map((t: TimelineItem) => t.completed))),
    0
  );

  const perDayCounts: number[] = days.map((_, idx: number) =>
    view.reduce(
      (sum: number, h: HabitView) =>
        h.timeline[idx]?.completed ? sum + 1 : sum,
      0
    )
  );

  return (
    <div className="px-4 md:px-6 py-6 space-y-8">
      <header className="px-1">
        <h2 className="text-2xl font-semibold tracking-tight">Habits</h2>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-4">
          <h3 className="text-md font-bold">This Week</h3>
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
                className="h-2 rounded-full progress-fill"
                style={{
                  width: `${completionPct}%`,
                  backgroundColor: "var(--twc-accent)",
                }}
              />
            </div>
            <div className="mt-2 text-xs" style={{ color: "var(--twc-muted)" }}>
              {completionPct}% complete ({completedCells}/{totalCells} checks)
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-md font-bold">Streaks</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--twc-muted)" }}>
            Best current and best 7-day streaks
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <StreakMetric label="Current (max)" value={currentStreakMax} />
            <StreakMetric label="Best (last 7 days)" value={bestStreakMax} />
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-md font-bold">Last 7 Days</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--twc-muted)" }}>
            Daily total completions across all habits
          </p>
          <div className="mt-4">
            <SparkBars
              counts={perDayCounts}
              height={35}
              barWidth={12}
              gap={8}
            />
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

      {/* Main list */}
      <Card className="p-0">
        {/* IMPORTANT: only allow the "table scroll container" on sm+ */}
        <div className="sm:overflow-auto">
          {/* Desktop/table header row ONLY (hide it on mobile) */}
          <div className="hidden sm:flex px-4 pt-4 pb-3 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            <div className="text-md font-bold">All habits</div>

            <div className="overflow-auto">
              <div className="min-w-[16rem] grid grid-cols-8 gap-2">
                {days.map((d) => (
                  <div
                    key={d.iso}
                    className={`h-8 flex items-center justify-center text-[11px] text-center ${
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
                <div className="w-8 h-8" aria-hidden />
              </div>
            </div>
          </div>

          {/* Mobile header */}
          <div className="sm:hidden px-4 pt-4 pb-3">
            <div className="text-md font-bold">All habits</div>
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
                <p
                  className="mt-2 text-sm"
                  style={{ color: "var(--twc-muted)" }}
                >
                  Add your first habit below to start building streaks.
                </p>
              </div>
            </div>
          ) : (
            <ul>
              {view.map((h: HabitView, i: number) => (
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
        </div>
      </Card>

      <QuickAddHabit />
    </div>
  );
}
