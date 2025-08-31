import { prisma } from "@/lib/prisma";
import Card from "@/components/cards/Card";
import StatCardsRow, {
  type StatItem,
} from "@/components/dashboard/StatCardsRow";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import HabitStreakBars from "@/components/dashboard/HabitStreakBars";
import RecentlyCompleted from "@/components/dashboard/RecentlyCompleted";
import ComingSoon from "@/components/dashboard/ComingSoon";

/* ---------- UTC day helpers ---------- */
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

export const revalidate = 60;

export default async function Home() {
  const today = startOfDayUTC();
  const since = addDays(today, -60);

  // Habits (for streaks + today count)
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

  // Recently completed tasks
  const recentCompletedDb = await prisma.task.findMany({
    where: { status: "DONE", completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
    take: 5,
    select: { id: true, title: true, completedAt: true },
  });
  const timeFmt = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const recentCompleted = recentCompletedDb.map((t) => ({
    id: t.id,
    title: t.title,
    when: t.completedAt ? timeFmt.format(t.completedAt) : "—",
  }));

  // Stats
  const openTasks = 12;
  const goalsOnTrackCurrent = 2;
  const goalsOnTrackTotal = 4;

  const statItems: StatItem[] = [
    {
      label: "Habits completed (today)",
      value: habitsCompletedToday,
      positive: true,
      iconKey: "activity",
    },
    {
      label: "Open tasks",
      value: openTasks,
      positive: false,
      iconKey: "tasks",
    },
    {
      label: "Goals on track",
      value: goalsOnTrackCurrent, // animates (your StatCardsRow can handle this)
      total: goalsOnTrackTotal, // stays fixed “/x”
      positive: true,
      iconKey: "target",
    },
  ];

  return (
    <div className="px-4 md:px-6 py-6 space-y-8">
      <DashboardHeader />

      <StatCardsRow items={statItems} />

      {/* Habit streak bars */}
      <Card
        title="Weekly habit streaks"
        subtitle="Current streak by habit"
        className="border"
      >
        <div className="p-4 md:p-5">
          <HabitStreakBars
            data={streaks.map((s) => ({ name: s.name, streak: s.streak }))}
          />
        </div>
      </Card>

      {/* Recently Completed */}
      <Card
        title="Recently completed"
        subtitle="Most recent 5 tasks you finished"
        className="border"
      >
        <div className="p-2 md:p-3">
          <RecentlyCompleted items={recentCompleted} />
        </div>
      </Card>

      {/* Coming soon */}
      <Card
        title="Coming soon"
        subtitle="A peek at what's on the way"
        className="border"
      >
        <ComingSoon />
      </Card>
    </div>
  );
}
