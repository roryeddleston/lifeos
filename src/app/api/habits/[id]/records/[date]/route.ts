import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function startOfDayUTC(d: Date) {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}

type RouteParams = {
  params: Promise<{ id: string; date: string }>;
};

type RequestBody = { completed?: boolean };

export async function POST(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, date } = await params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date param" }, { status: 400 });
  }

  const when = new Date(`${date}T00:00:00.000Z`);
  const dayUTC = startOfDayUTC(when);

  let body: RequestBody | null = null;
  try {
    body = await req.json().catch(() => null);
  } catch {
    body = null;
  }

  const hasExplicit = typeof body?.completed === "boolean";
  const explicit: boolean | null = hasExplicit
    ? Boolean(body!.completed)
    : null;

  try {
    const habit = await prisma.habit.findFirst({
      where: {
        id,
        userId,
      },
      select: { id: true },
    });

    if (!habit) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const existing = await prisma.habitRecord.findUnique({
      where: {
        habitId_date: {
          habitId: id,
          date: dayUTC,
        },
      },
    });

    const nextCompleted = explicit ?? !Boolean(existing?.completed);

    const saved = await prisma.habitRecord.upsert({
      where: {
        habitId_date: {
          habitId: id,
          date: dayUTC,
        },
      },
      update: { completed: nextCompleted },
      create: {
        habitId: id,
        date: dayUTC,
        completed: nextCompleted,
      },
      select: {
        id: true,
        habitId: true,
        date: true,
        completed: true,
      },
    });

    return NextResponse.json(saved, { status: 200 });
  } catch (e) {
    console.error("POST /api/habits/[id]/records/[date] failed", e);
    return NextResponse.json(
      { error: "Failed to update habit record" },
      { status: 500 }
    );
  }
}
