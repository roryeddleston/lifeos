import { prisma } from "@/lib/prisma";
import GoalsTabs from "@/components/goals/GoalsTabs";
import QuickAddGoal from "@/components/goals/QuickAddGoal";
import { formatDueLabel } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  // Fetch from DB (deadline is Date | null here)
  const goalsDb = await prisma.goal.findMany({
    orderBy: { createdAt: "asc" },
  });

  // Serialize deadline -> string | null for client components
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
      {/* Heading */}
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

      {/* Tabs: Active / Completed */}
      <GoalsTabs active={active} completed={completed} />

      {/* Add goal */}
      <QuickAddGoal />
    </div>
  );
}
