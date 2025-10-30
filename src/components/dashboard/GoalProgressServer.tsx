import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

type GoalProgress = {
  id: string;
  title: string;
  progress: number; // 0..100
};

export default async function GoalProgressServer() {
  const { userId } = await auth();
  if (!userId) return null;

  // Fetch required fields only
  const goalsDb = await prisma.goal.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      targetValue: true,
      currentValue: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Normalize to 0..100 and guard against bad/zero targets
  const goals: GoalProgress[] = goalsDb.map((g) => {
    const target = Number(g.targetValue) || 0;
    const current = Math.max(0, Number(g.currentValue) || 0);
    const pct =
      target > 0
        ? Math.max(0, Math.min(100, Math.round((current / target) * 100)))
        : 0;
    return { id: g.id, title: g.title, progress: pct };
  });

  // Sort by progress (desc) and take top 6
  const items: GoalProgress[] = goals
    .slice()
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 6);

  const hasAny = items.length > 0;

  return (
    <section
      className="rounded-xl border"
      style={{
        borderColor: "var(--twc-border)",
        backgroundColor: "var(--twc-surface)",
      }}
    >
      <div className="p-3 md:p-4">
        <div className="flex items-center justify-between">
          <h3
            className="text-sm font-medium"
            style={{ color: "var(--twc-text)" }}
          >
            Goal progression
          </h3>
          <span className="text-xs" style={{ color: "var(--twc-muted)" }}>
            {goals.length} total
          </span>
        </div>

        {!hasAny ? (
          <div
            className="mt-6 rounded-lg p-4 text-center"
            style={{
              border: "1px solid var(--twc-border)",
              backgroundColor:
                "color-mix(in oklab, var(--twc-text) 4%, var(--twc-surface))",
              color: "var(--twc-muted)",
            }}
          >
            No goals yet — add one to see progress.
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {items.map((g) => (
              <li key={g.id} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div
                    className="text-sm truncate"
                    style={{ color: "var(--twc-text)" }}
                    title={g.title}
                  >
                    {g.title}
                  </div>
                  <div
                    className="mt-2 h-2 w-full rounded-full"
                    style={{
                      backgroundColor:
                        "color-mix(in oklab, var(--twc-text) 8%, var(--twc-surface))",
                    }}
                  >
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${g.progress}%`,
                        backgroundColor: "var(--twc-accent)",
                      }}
                      aria-label={`${g.progress}% complete`}
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={g.progress}
                    />
                  </div>
                </div>

                <div
                  className="w-12 text-right text-xs tabular-nums"
                  style={{ color: "var(--twc-muted)" }}
                >
                  {g.progress}%
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
