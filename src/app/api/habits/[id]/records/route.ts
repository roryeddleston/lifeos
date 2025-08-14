import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function startOfTodayUTC() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await req.json().catch(() => null);
  const completed =
    typeof body?.completed === "boolean" ? body.completed : true;

  const today = startOfTodayUTC();

  // Upsert today's record via unique(date, habitId)
  const rec = await prisma.habitRecord.upsert({
    where: { date_habitId: { date: today, habitId: id } },
    update: { completed },
    create: { habitId: id, date: today, completed },
  });

  return NextResponse.json(rec);
}
