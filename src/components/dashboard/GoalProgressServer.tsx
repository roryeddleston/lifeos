import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";

type GoalProgress = { id: string; title: string; progress: number };

export default async function GoalProgressServer() {
  noStore(); // always render dynamically (no caching)
  const { userId } = await auth();
  if (!userId) return null;

  let items: GoalProgress[] = [];
  try {
    const rows = await prisma.goal.findMany({
      where: { userId },
      select: { id: true, title: true, targetValue: true, currentValue: true },
      orderBy: { createdAt: "asc" },
      take: 24, // cap work on server
    });

    items = rows
      .map(({ id, title, targetValue, currentValue }) => {
        const target = Math.max(0, Number(targetValue) || 0);
        const current = Math.max(0, Number(currentValue) || 0);
        const pct =
          target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
        return { id, title, progress: pct };
      })
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 6);
  } catch {
    // soft-fail: show empty state instead of keeping Suspense fallback forever
    items = [];
  }

  const hasAny = items.length > 0;

  return (
    <section
      className="rounded-xl border"
      style={{
        borderColor: "var(--twc-border)",
        backgroundColor: "var(--twc-surface)",
      }}
    >
      <div className="p-8">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 m">
            <h3
              className="text-md font-bold"
              style={{ color: "var(--twc-text)" }}
            >
              Goal progression
            </h3>
            <p className="text-sm mt-1" style={{ color: "var(--twc-muted)" }}>
              Overview of your top goals
            </p>
          </div>
          <span
            className="text-xs shrink-0 self-start"
            style={{ color: "var(--twc-muted)" }}
            aria-hidden
          >
            %
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
