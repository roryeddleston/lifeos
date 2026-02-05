// /src/lib/dashboard.ts

import { prisma } from "./prisma";
import { unstable_cache } from "next/cache";

async function _getDashboardMetrics(userId: string) {
  let habitsToday = 0;
  let openTasks = 0;
  let goalsTotal = 0;
  let goalsOnTrack = 0;

  try {
    const [row] = await prisma.$queryRaw<
      {
        habits_today: bigint;
        open_tasks: bigint;
        goals_total: bigint;
        goals_on_track: bigint;
      }[]
    >`
      WITH now_ts AS (
        SELECT (now() AT TIME ZONE 'Europe/London') AS ts
      )
      SELECT
        (
          SELECT COUNT(*)::bigint
          FROM "HabitRecord" hr
          JOIN "Habit" h ON h."id" = hr."habitId"
          WHERE h."userId" = ${userId}
            AND hr."completed" = TRUE
            AND hr."date" >= date_trunc('day', (SELECT ts FROM now_ts))
            AND hr."date"  <  date_trunc('day', (SELECT ts FROM now_ts)) + INTERVAL '1 day'
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
        ) AS goals_total,
        (
          SELECT COUNT(*)::bigint
          FROM "Goal" g, now_ts
          WHERE g."userId" = ${userId}
            AND (
              g."targetValue" IS NULL OR g."targetValue" <= 0
              OR g."deadline" IS NULL
              OR COALESCE(g."currentValue", 0) >= (
                g."targetValue"::numeric *
                LEAST(
                  GREATEST(
                    0,
                    CEIL(EXTRACT(EPOCH FROM (now_ts.ts - g."createdAt")) / 86400)
                  ),
                  GREATEST(
                    1,
                    CEIL(EXTRACT(EPOCH FROM (g."deadline" - g."createdAt")) / 86400)
                  )
                )::numeric
                /
                GREATEST(
                  1,
                  CEIL(EXTRACT(EPOCH FROM (g."deadline" - g."createdAt")) / 86400)
                )
              )
            )
        ) AS goals_on_track
    `;

    if (row) {
      habitsToday = Number(row.habits_today ?? 0);
      openTasks = Number(row.open_tasks ?? 0);
      goalsTotal = Number(row.goals_total ?? 0);
      goalsOnTrack = Number(row.goals_on_track ?? 0);
    }
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

export async function getDashboardMetrics(userId: string) {
  const cached = unstable_cache(
    () => _getDashboardMetrics(userId),
    ["dashboard-metrics", userId],
    {
      revalidate: 30,
      tags: [`dashboard-metrics:${userId}`],
    }
  );

  return cached();
}
