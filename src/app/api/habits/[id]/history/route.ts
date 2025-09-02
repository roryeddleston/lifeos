import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/habits/[id]/history
export async function GET(req: Request, context: { params: { id: string } }) {
  const { userId } = await auth();
  const habitId = context.params.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const habit = await prisma.habit.findFirst({
      where: {
        id: habitId,
        userId,
      },
      select: {
        id: true,
        name: true,
        completions: {
          orderBy: {
            date: "asc",
          },
          select: {
            date: true,
            completed: true,
          },
        },
      },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const completionsByWeek = new Map<
      string,
      { total: number; done: number }
    >();

    for (const { date, completed } of habit.completions) {
      const d = new Date(date);
      const utc = new Date(
        Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
      );
      utc.setUTCDate(utc.getUTCDate() + 4 - (utc.getUTCDay() || 7));
      const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil(((+utc - +yearStart) / 86400000 + 1) / 7);
      const weekStr = String(weekNo).padStart(2, "0");
      const key = `${utc.getUTCFullYear()}-W${weekStr}`;

      const entry = completionsByWeek.get(key) || { total: 0, done: 0 };
      entry.total += 1;
      if (completed) entry.done += 1;
      completionsByWeek.set(key, entry);
    }

    const series = Array.from(completionsByWeek.entries())
      .map(([week, { total, done }]) => ({
        week,
        pct: total > 0 ? done / total : 0,
      }))
      .sort((a, b) => a.week.localeCompare(b.week));

    return NextResponse.json({
      id: habit.id,
      name: habit.name,
      series,
      countWeeks: series.length,
    });
  } catch (err) {
    console.error("GET /api/habits/[id]/history failed", err);
    return NextResponse.json(
      { error: "Failed to load habit history" },
      { status: 500 }
    );
  }
}
