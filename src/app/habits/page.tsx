import { prisma } from "@/lib/prisma";
import Card from "@/components/cards/Card";
import QuickAddHabit from "@/components/habits/QuickAddHabit";
import HabitRow from "@/components/habits/HabitRow";

export const dynamic = "force-dynamic";

function startOfTodayUTC() {
  const now = new Date();
  const d = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  return d;
}

export default async function HabitsPage() {
  const today = startOfTodayUTC();

  const habits = await prisma.habit.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      records: {
        where: { date: today },
        select: { id: true, completed: true, date: true },
      },
    },
  });

  return (
    <div className="p-6 space-y-6">
      <Card className="border-0 !shadow-none">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-sm font-medium tracking-tight">Today</h2>
        </div>
        <div className="divide-y">
          {habits.length === 0 ? (
            <div className="px-4 py-10 text-center text-gray-500">
              No habits yet — add one below.
            </div>
          ) : (
            habits.map((h) => {
              const completed = h.records[0]?.completed === true;
              return (
                <HabitRow
                  key={h.id}
                  id={h.id}
                  name={h.name}
                  completed={completed}
                />
              );
            })
          )}
        </div>
      </Card>

      <QuickAddHabit />
    </div>
  );
}
