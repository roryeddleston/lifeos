import { prisma } from "@/lib/prisma";
import Card from "@/components/cards/Card";
import GoalCard from "@/components/goals/GoalCard";
import QuickAddGoal from "@/components/goals/QuickAddGoal";
import { formatDueLabel } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const goals = await prisma.goal.findMany({
    orderBy: { createdAt: "asc" },
  });

  const total = goals.length;
  const completed = goals.filter((g) => g.currentValue >= g.targetValue).length;

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="px-4 pt-2">
        <h1
          className="text-2xl font-medium tracking-tight"
          style={{ color: "var(--twc-text)" }}
        >
          Goals
        </h1>
        {total > 0 && (
          <p className="mt-1 text-sm" style={{ color: "var(--twc-muted)" }}>
            {completed}/{total} completed ·{" "}
            {goals.some((g) => g.deadline)
              ? `next deadline: ${formatDueLabel(
                  goals
                    .filter((g) => g.deadline)
                    .map((g) => g.deadline!.toISOString())
                    .sort()[0] ?? null
                )}`
              : "no deadlines"}
          </p>
        )}
      </div>

      {/* List */}
      <Card className="border-0 !shadow-none">
        {goals.length === 0 ? (
          <div className="px-4 py-16">
            <div
              className="mx-auto max-w-md rounded-lg px-6 py-8 text-center"
              style={{
                backgroundColor: "var(--twc-surface)",
                border: `1px solid var(--twc-border)`,
                color: "var(--twc-text)",
              }}
            >
              <h3
                className="text-sm font-medium"
                style={{ color: "var(--twc-text)" }}
              >
                No goals yet
              </h3>
              <p className="mt-2 text-sm" style={{ color: "var(--twc-muted)" }}>
                Add your first goal below to start tracking progress.
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--twc-border)]">
            {goals.map((g) => (
              <li key={g.id} className="px-4 py-3">
                <GoalCard goal={g} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <QuickAddGoal />
    </div>
  );
}
