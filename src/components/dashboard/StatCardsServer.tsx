import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Card from "@/components/cards/Card";
import { CheckSquare, ClipboardList, Target } from "lucide-react";

export default async function StatCardsServer() {
  const { userId } = await auth();
  if (!userId) return null;

  // Defaults so the UI renders even if DB blips
  let habitsToday = 0;
  let openTasks = 0;
  let goalsTotal = 0;
  let goalsOnTrack = 0;

  try {
    // One round-trip for counts we can do in SQL
    const [row] = await prisma.$queryRaw<
      { habits_today: bigint; open_tasks: bigint; goals_total: bigint }[]
    >`
      SELECT
        -- Habits completed today (UTC)
        (
          SELECT COUNT(*)::bigint
          FROM "HabitRecord" hr
          JOIN "Habit" h ON h."id" = hr."habitId"
          WHERE h."userId" = ${userId}
            AND hr."completed" = TRUE
            AND hr."date" >= date_trunc('day', now() AT TIME ZONE 'UTC')
            AND hr."date"  < date_trunc('day', now() AT TIME ZONE 'UTC') + INTERVAL '1 day'
        ) AS habits_today,
        -- Open tasks (not DONE)
        (
          SELECT COUNT(*)::bigint
          FROM "Task"
          WHERE "userId" = ${userId}
            AND "status" <> 'DONE'
        ) AS open_tasks,
        -- Total goals
        (
          SELECT COUNT(*)::bigint
          FROM "Goal"
          WHERE "userId" = ${userId}
        ) AS goals_total
    `;
    if (row) {
      habitsToday = Number(row.habits_today ?? 0);
      openTasks = Number(row.open_tasks ?? 0);
      goalsTotal = Number(row.goals_total ?? 0);
    }

    // Fetch goals to compute "on track"
    const goals = await prisma.$queryRaw<
      {
        currentValue: number | null;
        targetValue: number | null;
        createdAt: Date;
        deadline: Date | null;
      }[]
    >`
      SELECT "currentValue", "targetValue", "createdAt", "deadline"
      FROM "Goal" WHERE "userId" = ${userId}
    `;

    const now = new Date();
    const onTrack = (g: {
      currentValue: number | null;
      targetValue: number | null;
      createdAt: Date;
      deadline: Date | null;
    }) => {
      if (g.targetValue == null || g.targetValue <= 0) return true; // treat as neutral
      if (!g.deadline) return true;
      const totalDays = Math.max(
        1,
        Math.ceil((g.deadline.getTime() - g.createdAt.getTime()) / 86_400_000)
      );
      const elapsed = Math.max(
        0,
        Math.min(
          totalDays,
          Math.ceil((now.getTime() - g.createdAt.getTime()) / 86_400_000)
        )
      );
      const expected = (g.targetValue * elapsed) / totalDays;
      return (g.currentValue ?? 0) + 1e-6 >= expected;
    };

    goalsOnTrack = goals.reduce((acc, g) => acc + (onTrack(g) ? 1 : 0), 0);
    goalsTotal = goals.length; // ensure total matches the set we evaluated
  } catch {
    // keep defaults
  }

  const items = [
    {
      label: "Habits completed (today)",
      value: String(habitsToday),
      Icon: CheckSquare,
    },
    { label: "Open tasks", value: String(openTasks), Icon: ClipboardList },
    {
      label: "Goals on track",
      value: `${goalsOnTrack}/${goalsTotal}`,
      Icon: Target,
    },
  ] as const;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map(({ label, value, Icon }) => (
        <Card key={label} className="p-3 md:p-4">
          <div className="flex items-center gap-3">
            <div
              className="shrink-0 rounded-lg p-2"
              style={{
                background:
                  "color-mix(in oklab, var(--twc-accent) 12%, transparent)",
                color: "var(--twc-accent)",
              }}
              aria-hidden
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="text-sm" style={{ color: "var(--twc-muted)" }}>
                {label}
              </div>
              <div
                className="mt-0.5 text-xl font-semibold tabular-nums"
                style={{ color: "var(--twc-text)" }}
              >
                {value}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
