import { prisma } from "@/lib/prisma";
import Card from "@/components/cards/Card";
import StatCard from "@/components/cards/StatCard";
import WeeklyStreaks from "@/components/charts/WeeklyStreaks";
import { Activity, ListTodo, Target, BookOpen, Dumbbell } from "lucide-react";

// Helper: UTC start of a given day
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
function currentStreakFromSet(completedISOSet: Set<string>, todayISO: string) {
  let streak = 0;
  let cursor = startOfDayUTC(new Date(todayISO));
  while (true) {
    const iso = cursor.toISOString().slice(0, 10);
    if (!completedISOSet.has(iso)) break;
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

const fmt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export const revalidate = 60;

export default async function Home() {
  const today = startOfDayUTC();
  const since = addDays(today, -60);

  const habits = await prisma.habit.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      records: {
        where: { date: { gte: since, lte: today }, completed: true },
        select: { date: true },
      },
    },
  });

  const todayISO = today.toISOString().slice(0, 10);
  const streaks = habits.map((h) => {
    const completedSet = new Set(
      h.records.map((r) => r.date.toISOString().slice(0, 10))
    );
    const streak = currentStreakFromSet(completedSet, todayISO);
    return { id: h.id, name: h.name, streak };
  });

  const habitsCompletedToday = habits.reduce((sum, h) => {
    const hasToday = h.records.some(
      (r) => r.date.toISOString().slice(0, 10) === todayISO
    );
    return sum + (hasToday ? 1 : 0);
  }, 0);

  const recentCompleted = await prisma.task.findMany({
    where: { status: "DONE", completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      completedAt: true,
    },
  });

  const openTasks = 12;
  const goalsOnTrack = "2/4";

  return (
    <div className="px-4 md:px-6 py-6 space-y-8">
      {/* Heading */}
      <header className="px-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--twc-muted)]">
          Snapshot of habits, tasks, and progress.
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Habits completed (today)"
          value={habitsCompletedToday}
          delta=""
          positive
          icon={Activity}
        />
        <StatCard
          label="Open tasks"
          value={openTasks}
          delta=""
          positive={false}
          icon={ListTodo}
        />
        <StatCard
          label="Goals on track"
          value={goalsOnTrack}
          delta=""
          positive
          icon={Target}
        />
      </div>

      {/* Weekly Habit Streaks */}
      <Card
        title="Weekly Habit Streaks"
        subtitle="Current streak by habit"
        className="border"
      >
        <div className="p-4 md:p-5">
          <WeeklyStreaks data={streaks} />
        </div>
      </Card>

      {/* Recently Completed */}
      <Card
        title="Recently Completed"
        subtitle="Most recent 5 tasks you finished"
        className="border"
      >
        <div className="p-2 md:p-3">
          <ul className="divide-y divide-[var(--twc-border)]">
            {recentCompleted.length === 0 ? (
              <li className="py-4 px-3 text-sm text-[var(--twc-muted)]">
                No tasks completed yet.
              </li>
            ) : (
              recentCompleted.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between px-3 py-3 hover:bg-[var(--twc-surface-hover)] transition-colors"
                >
                  <span className="text-sm leading-5">{t.title}</span>
                  <span className="text-xs tabular-nums text-[var(--twc-muted)]">
                    {t.completedAt ? fmt.format(t.completedAt) : "—"}
                  </span>
                </li>
              ))
            )}
          </ul>

          <div className="mt-3 flex justify-end">
            <a
              href="/tasks?view=done"
              className="text-xs font-medium text-[var(--twc-accent)] hover:underline"
            >
              View all completed
            </a>
          </div>
        </div>
      </Card>

      {/* Coming soon */}
      <Card
        title="Coming soon"
        subtitle="A peek at what's on the way"
        className="border"
      >
        <div className="p-3 md:p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {/* Journal */}
            <div
              className="rounded-xl border p-3 md:p-4 transition-colors hover:bg-[var(--twc-surface-hover)]"
              style={{ borderColor: "var(--twc-border)" }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="rounded-lg p-2"
                  style={{
                    background:
                      "color-mix(in oklab, var(--twc-accent) 12%, transparent)",
                    color: "var(--twc-accent)",
                  }}
                >
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div
                    className="font-medium"
                    style={{ color: "var(--twc-text)" }}
                  >
                    Journal
                  </div>
                  <p className="mt-1 text-sm leading-5 text-[var(--twc-muted)]">
                    Daily journaling with fast search and filters — reflect,
                    tag, and find entries in seconds.
                  </p>
                </div>
              </div>
            </div>

            {/* Workout tracker */}
            <div
              className="rounded-xl border p-3 md:p-4 transition-colors hover:bg-[var(--twc-surface-hover)]"
              style={{ borderColor: "var(--twc-border)" }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="rounded-lg p-2"
                  style={{
                    background:
                      "color-mix(in oklab, var(--twc-accent) 12%, transparent)",
                    color: "var(--twc-accent)",
                  }}
                >
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div
                    className="font-medium"
                    style={{ color: "var(--twc-text)" }}
                  >
                    Workout tracker
                  </div>
                  <p className="mt-1 text-sm leading-5 text-[var(--twc-muted)]">
                    Log sessions, track previous workouts, and manage progress
                    over time with simple goals.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs text-[var(--twc-muted)]">
            Have ideas or requests? Pop them on your Tasks as a feature request.
          </p>
        </div>
      </Card>
    </div>
  );
}
