import { prisma } from "@/lib/prisma";
import Card from "@/components/cards/Card";
import StatCard from "@/components/cards/StatCard";
import WeeklyStreaks from "@/components/charts/WeeklyStreaks";
import { Activity, ListTodo, Target } from "lucide-react";

// Helper: UTC start of a given day
function startOfDayUTC(d = new Date()) {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}
// Helper: add N days (UTC)
function addDays(d: Date, n: number) {
  const copy = new Date(d);
  copy.setUTCDate(copy.getUTCDate() + n);
  return copy;
}
// Compute current streak given a Set of YYYY-MM-DD completed dates
function currentStreakFromSet(completedISOSet: Set<string>, todayISO: string) {
  // walk backward from today until a miss
  let streak = 0;
  let cursor = new Date(todayISO);
  // Make sure cursor is at 00:00Z
  cursor = startOfDayUTC(cursor);
  // Count today backward
  while (true) {
    const iso = cursor.toISOString().slice(0, 10);
    if (!completedISOSet.has(iso)) break;
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export default async function Home() {
  // ---- Fetch minimal data to compute streaks efficiently ----
  const today = startOfDayUTC();
  const lookbackDays = 60; // check last ~2 months for safety
  const since = addDays(today, -lookbackDays);

  const habits = await prisma.habit.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      records: {
        where: { date: { gte: since, lte: today }, completed: true },
        select: { date: true },
      },
    },
  });

  // Compute current streak per habit
  const todayISO = today.toISOString().slice(0, 10);
  const streaks = habits.map((h) => {
    const completedSet = new Set(
      h.records.map((r) => r.date.toISOString().slice(0, 10))
    );
    const streak = currentStreakFromSet(completedSet, todayISO);
    return { id: h.id, name: h.name, streak };
  });

  // Simple stats (keep your existing placeholders if you want)
  const habitsCompletedToday = habits.reduce((sum, h) => {
    const hasToday = h.records.some(
      (r) => r.date.toISOString().slice(0, 10) === todayISO
    );
    return sum + (hasToday ? 1 : 0);
  }, 0);

  // (Optional) quick task/goal placeholders – replace with real queries if desired
  const openTasks = 12;
  const goalsOnTrack = "2/4";

  return (
    <div className="p-6 space-y-6">
      {/* Heading */}
      <header className="px-1">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Weekly Habit Streaks Chart */}
      <Card title="Weekly Habit Streaks" subtitle="Current streak by habit">
        <WeeklyStreaks data={streaks} />
      </Card>
    </div>
  );
}
