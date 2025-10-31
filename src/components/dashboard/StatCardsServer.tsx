import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import StatCardRow from "./StatCardRow";

export default async function StatCardsServer() {
  const { userId } = await auth();
  if (!userId) return null;

  let habitsToday = 0;
  let openTasks = 0;
  let goalsTotal = 0;
  let goalsOnTrack = 0;

  try {
    const [row] = await prisma.$queryRaw<
      { habits_today: bigint; open_tasks: bigint; goals_total: bigint }[]
    >`
      SELECT
        (
          SELECT COUNT(*)::bigint
          FROM "HabitRecord" hr
          JOIN "Habit" h ON h."id" = hr."habitId"
          WHERE h."userId" = ${userId}
            AND hr."completed" = TRUE
            AND hr."date" >= date_trunc('day', now() AT TIME ZONE 'UTC')
            AND hr."date"  <  date_trunc('day', now() AT TIME ZONE 'UTC') + INTERVAL '1 day'
        ) AS habits_today,
        (
          SELECT COUNT(*)::bigint
          FROM "Task"
          WHERE "userId" = ${userId}
            AND "status" <> 'DONE'
        ) AS open_tasks,
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

    const goals = await prisma.$queryRaw<
      {
        currentValue: number | null;
        targetValue: number | null;
        createdAt: Date;
        deadline: Date | null;
      }[]
    >`SELECT "currentValue","targetValue","createdAt","deadline"
       FROM "Goal" WHERE "userId" = ${userId}`;

    const now = new Date();
    const onTrack = (g: {
      currentValue: number | null;
      targetValue: number | null;
      createdAt: Date;
      deadline: Date | null;
    }) => {
      if (g.targetValue == null || g.targetValue <= 0) return true;
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
  } catch {
    // keep defaults
  }

  return (
    <StatCardRow
      metrics={{ habitsToday, openTasks, goalsOnTrack, goalsTotal }}
    />
  );
}
