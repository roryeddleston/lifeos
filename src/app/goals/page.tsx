import { auth } from "@clerk/nextjs/server";
import GoalsTabs from "@/components/goals/GoalsTabs";
import QuickAddGoal from "@/components/goals/QuickAddGoal";
import { formatDueLabel } from "@/lib/date";
import { getGoalsForUser } from "@/lib/goals";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function GoalsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  let goalsDb: Array<{
    id: string;
    title: string;
    description: string | null;
    targetValue: number;
    currentValue: number;
    unit: string;
    deadline: Date | null;
    createdAt: Date;
  }> = [];

  try {
    goalsDb = await getGoalsForUser(userId);
  } catch {
    console.warn("GoalsPage: DB unavailable, rendering empty state.");
    goalsDb = [];
  }

  // Normalize dates for client components (strings not Dates)
  const goals = goalsDb.map((g) => ({
    ...g,
    deadline: g.deadline ? g.deadline.toISOString() : null,
    createdAt: g.createdAt.toISOString(),
  }));

  const active = goals.filter((g) => g.currentValue < g.targetValue);
  const completed = goals.filter((g) => g.currentValue >= g.targetValue);

  const total = goals.length;
  const completedCount = completed.length;

  const nextDeadlineIso =
    goals
      .filter((g) => g.deadline)
      .map((g) => g.deadline as string)
      .sort()[0] ?? null;

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
            {nextDeadlineIso
              ? `next deadline: ${formatDueLabel(nextDeadlineIso)}`
              : "no deadlines"}
          </p>
        )}
      </header>

      <GoalsTabs active={active} completed={completed} />
      <QuickAddGoal />
    </div>
  );
}
