import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/user";

function startOfDayUTC(d: Date) {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}

type RouteParams = { params: Promise<{ id: string; date: string }> };

export async function POST(req: Request, { params }: RouteParams) {
  const userId = await getUserId();
  const { id, date } = await params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date param" }, { status: 400 });
  }

  // Ownership check
  const habit = await prisma.habit.findFirst({ where: { id, userId } });
  if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const when = new Date(`${date}T00:00:00.000Z`);
  const dayUTC = startOfDayUTC(when);

  type ToggleBody = { completed?: boolean } | null;
  let body: ToggleBody = null;
  try {
    const raw: unknown = await req.json().catch(() => null);
    if (raw && typeof raw === "object") {
      const completed = (raw as Record<string, unknown>).completed;
      if (typeof completed === "boolean") body = { completed };
    }
  } catch {
    body = null;
  }

  const hasExplicit = !!body && typeof body.completed === "boolean";
  const explicit: boolean | null = hasExplicit
    ? Boolean(body!.completed)
    : null;

  try {
    const existing = await prisma.habitRecord.findUnique({
      where: { habitId_date: { habitId: id, date: dayUTC } },
    });

    const nextCompleted = explicit ?? !Boolean(existing?.completed);

    const saved = await prisma.habitRecord.upsert({
      where: { habitId_date: { habitId: id, date: dayUTC } },
      update: { completed: nextCompleted },
      create: { habitId: id, date: dayUTC, completed: nextCompleted },
      select: { id: true, habitId: true, date: true, completed: true },
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
