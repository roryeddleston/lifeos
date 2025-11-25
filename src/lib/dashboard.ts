import { prisma } from "./prisma";
import { unstable_cache } from "next/cache";

async function _getDashboardMetrics(userId: string) {
  let habitsToday = 0;
  let openTasks = 0;
  let goalsTotal = 0;
  let goalsOnTrack = 0;

  try {
    // single raw query to grab the 3 easy counts
    const metricsPromise = prisma.$queryRaw<
      { habits_today: bigint; open_tasks: bigint; goals_total: bigint }[]
    >`
      SELECT
        (
          SELECT COUNT(*)::bigint
          FROM "HabitRecord" hr
          JOIN "Habit" h ON h."id" = hr."habitId"
          WHERE h."userId" = ${userId}
            AND hr."completed" = TRUE
            AND hr."date" >= date_trunc('day', now() AT TIME ZONE 'Europe/London')
            AND hr."date"  <  date_trunc('day', now() AT TIME ZONE 'Europe/London') + INTERVAL '1 day'
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

    // now we fetch all goals to work out "on track"
    const goalsPromise = prisma.$queryRaw<
      {
        currentValue: number | null;
        targetValue: number | null;
        createdAt: Date;
        deadline: Date | null;
      }[]
    >`
      SELECT "currentValue","targetValue","createdAt","deadline"
      FROM "Goal"
      WHERE "userId" = ${userId}
    `;

    const [metricsRows, goals] = await Promise.all([
      metricsPromise,
      goalsPromise,
    ]);

    const row = metricsRows[0];

    if (row) {
      habitsToday = Number(row.habits_today ?? 0);
      openTasks = Number(row.open_tasks ?? 0);
      goalsTotal = Number(row.goals_total ?? 0);
    }

    const now = new Date();

    function isOnTrack(g: {
      currentValue: number | null;
      targetValue: number | null;
      createdAt: Date;
      deadline: Date | null;
    }) {
      // no target? call it on track
      if (!g.targetValue || g.targetValue <= 0) return true;
      // no deadline? also on track (can’t measure)
      if (!g.deadline) return true;

      const created = g.createdAt.getTime();
      const deadline = g.deadline.getTime();
      const nowMs = now.getTime();

      // total days in plan
      const totalDays = Math.max(
        1,
        Math.ceil((deadline - created) / 86_400_000)
      );

      // how many days have passed since creation
      const elapsed = Math.max(
        0,
        Math.min(totalDays, Math.ceil((nowMs - created) / 86_400_000))
      );

      const expected = (g.targetValue * elapsed) / totalDays;
      const current = g.currentValue ?? 0;

      // small epsilon to avoid float weirdness
      return current + 1e-6 >= expected;
    }

    goalsOnTrack = goals.reduce((acc, g) => acc + (isOnTrack(g) ? 1 : 0), 0);
  } catch (e) {
    console.error("getDashboardMetrics failed:", e);
  }

  return {
    habitsToday,
    openTasks,
    goalsTotal,
    goalsOnTrack,
  };
}

/**
 * Wrapped in unstable_cache for a small perf boost:
 * - results are cached per userId
 * - revalidated every 30 seconds
 */

export const getDashboardMetrics = unstable_cache(
  (userId: string) => _getDashboardMetrics(userId),
  ["dashboard-metrics"],
  {
    revalidate: 30,
  }
);
