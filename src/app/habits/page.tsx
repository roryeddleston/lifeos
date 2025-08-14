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

  // Shared 7-day window (oldest -> newest). Header will match tile widths.
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
    // compute streak from newest back
    let streak = 0;
    for (let i = timeline.length - 1; i >= 0; i--) {
      if (timeline[i].completed) streak++;
      else break;
    }
    return { id: h.id, name: h.name, timeline, streak };
  });

  return (
    <div className="p-6 space-y-6">
      <Card className="border-0 !shadow-none">
        {/* Title + weekday header (aligned to tile sizes) */}
        <div className="px-4 pt-4 pb-2 grid grid-cols-[minmax(0,1fr)_auto] items-end">
          <h2 className="text-sm font-medium tracking-tight">Habits</h2>
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
          <ul className="divide-y">
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
