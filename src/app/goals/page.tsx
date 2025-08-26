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
    <div className="p-6 space-y-6">
      {/* Heading */}
      <div className="px-4 pt-2">
        <h1 className="text-2xl font-medium tracking-tight">Goals</h1>
        {total > 0 && (
          <p className="mt-1 text-sm text-gray-600">
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
            <div className="mx-auto max-w-md rounded-lg border bg-white/70 px-6 py-8 text-center">
              <h3 className="text-sm font-medium text-gray-900">
                No goals yet
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Add your first goal below to start tracking progress.
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
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
