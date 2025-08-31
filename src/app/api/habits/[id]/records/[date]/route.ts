import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/user";
import { revalidatePath } from "next/cache";

// Ensure a pure UTC date-only timestamp (00:00:00Z)
function startOfDayUTC(d: Date) {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}

type RouteParams = {
  params: Promise<{ id: string; date: string }>;
};

type ToggleBody = { completed?: boolean } | null;

export async function POST(req: Request, { params }: RouteParams) {
  const userId = await getUserId();
  const { id, date } = await params;

  // Expect :date as YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date param" }, { status: 400 });
  }

  // Verify habit belongs to user
  const habit = await prisma.habit.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!habit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Construct UTC midnight for that calendar day
  const when = new Date(`${date}T00:00:00.000Z`);
  const dayUTC = startOfDayUTC(when);

  // Optional body: { completed?: boolean }
  let body: ToggleBody = null;
  try {
    const raw = await req.json().catch(() => null);
    if (raw && typeof raw === "object") {
      const v = (raw as Record<string, unknown>).completed;
      if (typeof v === "boolean") body = { completed: v };
    }
  } catch {
    body = null;
  }

  const explicit =
    body && typeof body.completed === "boolean" ? body.completed : null;

  try {
    // Look up existing record for (habitId, date)
    const existing = await prisma.habitRecord.findUnique({
      where: { habitId_date: { habitId: id, date: dayUTC } },
      select: { id: true, completed: true },
    });

    // Decide the next value: toggle if not explicitly provided
    const nextCompleted = explicit ?? !Boolean(existing?.completed);

    // Upsert to set the desired value
    const saved = await prisma.habitRecord.upsert({
      where: { habitId_date: { habitId: id, date: dayUTC } },
      update: { completed: nextCompleted },
      create: { habitId: id, date: dayUTC, completed: nextCompleted },
      select: { id: true, habitId: true, date: true, completed: true },
    });

    revalidatePath("/");
    revalidatePath("/habits");

    return NextResponse.json(saved, { status: 200 });
  } catch (e) {
    console.error("POST /api/habits/[id]/records/[date] failed", e);
    return NextResponse.json(
      { error: "Failed to update habit record" },
      { status: 500 }
    );
  }
}
