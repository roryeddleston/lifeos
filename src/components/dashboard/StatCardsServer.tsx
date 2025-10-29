import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Card from "@/components/cards/Card";
import { CheckSquare, Target, Trophy, CheckCircle2 } from "lucide-react";

export default async function StatCardsServer() {
  const { userId } = await auth();
  if (!userId) return null;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [habitsCount, goals, tasksCompleted7d] = await Promise.all([
    prisma.habit.count({ where: { userId } }),
    prisma.goal.findMany({
      where: { userId },
      select: { currentValue: true, targetValue: true },
    }),
    prisma.task.count({
      where: { userId, status: "DONE", completedAt: { gte: sevenDaysAgo } },
    }),
  ]);

  const goalsCompletedCount = goals.filter(
    (g) =>
      g.targetValue != null &&
      (g.currentValue ?? 0) >= (g.targetValue as number)
  ).length;
  const goalsActiveCount = goals.length - goalsCompletedCount;

  const items = [
    { label: "Habits", value: habitsCount, Icon: CheckSquare },
    { label: "Active goals", value: goalsActiveCount, Icon: Target },
    { label: "Completed goals", value: goalsCompletedCount, Icon: Trophy },
    { label: "Tasks done (7d)", value: tasksCompleted7d, Icon: CheckCircle2 },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ label, value, Icon }) => (
        <Card key={label} className="p-4">
          <div className="flex items-center gap-3">
            <div
              aria-hidden
              className="shrink-0 rounded-lg p-2"
              style={{
                background:
                  "color-mix(in oklab, var(--twc-accent) 12%, transparent)",
                color: "var(--twc-accent)",
              }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="text-sm" style={{ color: "var(--twc-muted)" }}>
                {label}
              </div>
              <div
                className="mt-0.5 text-2xl font-semibold tabular-nums"
                style={{ color: "var(--twc-text)" }}
              >
                {value}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
