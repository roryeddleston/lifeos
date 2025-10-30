// src/components/dashboard/GoalProgressServer.tsx
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Card from "@/components/cards/Card";

export default async function GoalProgressServer() {
  const { userId } = await auth();
  if (!userId) return null;

  let goals: { id: string; title: string; progress: number };
  [] = [];

  try {
    const rows = await prisma.goal.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        currentValue: true,
        targetValue: true,
      },
      orderBy: { createdAt: "asc" },
    });

    goals = rows
      .filter((g) => (g.targetValue ?? 0) > 0)
      .map((g) => {
        const pct = Math.round(
          Math.max(
            0,
            Math.min(1, (g.currentValue ?? 0) / (g.targetValue ?? 1))
          ) * 100
        );
        return { id: g.id, title: g.title, progress: pct };
      })
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5);
  } catch {
    goals = [];
  }

  const max = 100;

  return (
    <Card className="p-4">
      <h3 className="text-md font-bold" style={{ color: "var(--twc-text)" }}>
        Goal progression
      </h3>
      <p className="mt-3 text-sm" style={{ color: "var(--twc-muted)" }}>
        Progress toward each active goal
      </p>

      {goals.length === 0 ? (
        <div
          className="mt-6 rounded-lg border p-6 text-center text-sm"
          style={{
            borderColor: "var(--twc-border)",
            color: "var(--twc-muted)",
          }}
        >
          No goals yet.
        </div>
      ) : (
        <div className="mt-4">
          <div
            className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 pb-2 text-xs"
            style={{ color: "var(--twc-muted)" }}
          ></div>

          <ul className="space-y-2">
            {goals.map((g) => (
              <li
                key={g.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"
              >
                <div className="min-w-0">
                  <div
                    className="truncate text-sm"
                    style={{ color: "var(--twc-text)" }}
                  >
                    {g.title}
                  </div>
                  <div
                    className="mt-1 h-2 w-full rounded-full"
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
                      aria-valuemax={max}
                      aria-valuenow={g.progress}
                    />
                  </div>
                </div>
                <div
                  className="pl-2 text-sm tabular-nums"
                  style={{ color: "var(--twc-text)" }}
                >
                  {g.progress}%
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
