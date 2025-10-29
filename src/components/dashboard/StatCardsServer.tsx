// src/components/dashboard/StatCardsServer.tsx
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Card from "@/components/cards/Card";

export default async function StatCardsServer() {
  const { userId } = await auth();
  if (!userId) return null;

  const [habitsCount, goalsActiveCount, goalsCompletedCount, tasksCompleted7d] =
    await Promise.all([
      prisma.habit.count({ where: { userId } }),
      prisma.goal
        .count({
          where: {
            userId,
            OR: [
              { targetValue: null },
              { currentValue: { lt: { not: null } as any } },
            ],
          },
        })
        .catch(async () => {
          // Fallback if nullable targetValue logic differs in schema
          const goals = await prisma.goal.findMany({
            where: { userId },
            select: { currentValue: true, targetValue: true },
          });
          return goals.filter(
            (g) =>
              (g.targetValue ?? Number.POSITIVE_INFINITY) >
              (g.currentValue ?? 0)
          ).length;
        }),
      prisma.goal
        .count({
          where: {
            userId,
            currentValue: { gte: 0 },
            targetValue: { not: null },
          },
        })
        .then(async (count) => {
          // refine completed = current >= target
          const goals = await prisma.goal.findMany({
            where: { userId },
            select: { currentValue: true, targetValue: true },
          });
          return goals.filter(
            (g) => (g.targetValue ?? Infinity) <= (g.currentValue ?? 0)
          ).length;
        }),
      prisma.task
        .count({
          where: {
            userId,
            status: "DONE",
            completedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        })
        .catch(() => 0),
    ]);

  const items = [
    { label: "Habits", value: habitsCount },
    { label: "Active goals", value: goalsActiveCount },
    { label: "Completed goals", value: goalsCompletedCount },
    { label: "Tasks done (7d)", value: tasksCompleted7d },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => (
        <Card key={it.label} className="p-4">
          <div className="text-sm" style={{ color: "var(--twc-muted)" }}>
            {it.label}
          </div>
          <div
            className="mt-1 text-2xl font-semibold tabular-nums"
            style={{ color: "var(--twc-text)" }}
          >
            {it.value}
          </div>
        </Card>
      ))}
    </div>
  );
}
