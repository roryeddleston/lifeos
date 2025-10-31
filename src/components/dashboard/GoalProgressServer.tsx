import { auth } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import ProgressFill from "@/components/anim/ProgressFill";
import { getGoalsForUser } from "@/lib/goals";

type GoalProgress = { id: string; title: string; progress: number };

export default async function GoalProgressServer() {
  noStore(); // render dynamically (no caching)
  const { userId } = await auth();
  if (!userId) return null;

  let items: GoalProgress[] = [];
  try {
    // get all goals
    const rows = await getGoalsForUser(userId);

    const mapped = rows
      .map(({ id, title, targetValue, currentValue }) => {
        const target = Math.max(0, Number(targetValue) || 0);
        const current = Math.max(0, Number(currentValue) || 0);
        const pct =
          target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
        return { id, title, progress: pct };
      })
      // original component sorted descending
      .sort((a, b) => b.progress - a.progress);

    // cap to 24 on server, then show top 6
    items = mapped.slice(0, 6);
  } catch {
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
          <div className="min-w-0">
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
            {items.map((g, i) => (
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
                    <ProgressFill
                      toPercent={g.progress}
                      duration={900}
                      delay={i * 60}
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
