import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import GoalsTabs from "@/components/goals/GoalsTabs";
import QuickAddGoal from "@/components/goals/QuickAddGoal";
import { formatDueLabel } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const { userId } = await auth();
  if (!userId) {
    return null; // or redirect, or show a login prompt
  }

  const goalsDb = await prisma.goal.findMany({
    where: { userId }, // ✅ Scope to the user
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      targetValue: true,
      currentValue: true,
      unit: true,
      deadline: true,
      createdAt: true,
    },
  });

  const goals = goalsDb.map((g) => ({
    ...g,
    deadline: g.deadline ? g.deadline.toISOString() : null,
    createdAt: g.createdAt.toISOString(),
  }));

  const active = goals.filter((g) => g.currentValue < g.targetValue);
  const completed = goals.filter((g) => g.currentValue >= g.targetValue);

  const total = goals.length;
  const completedCount = completed.length;

  return (
    <div className="px-4 md:px-6 py-6 space-y-8">
      <header className="px-1">
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ color: "var(--twc-text)" }}
        >
          Goals
        </h1>
        {total > 0 && (
          <p className="mt-1 text-sm" style={{ color: "var(--twc-muted)" }}>
            {completedCount}/{total} completed ·{" "}
            {goals.some((g) => g.deadline)
              ? `next deadline: ${formatDueLabel(
                  goals
                    .filter((g) => g.deadline)
                    .map((g) => g.deadline as string)
                    .sort()[0] ?? null
                )}`
              : "no deadlines"}
          </p>
        )}
      </header>

      <GoalsTabs active={active} completed={completed} />
      <QuickAddGoal />
    </div>
  );
}
