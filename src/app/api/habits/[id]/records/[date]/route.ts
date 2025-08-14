import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function isoToUTCDate(iso: string) {
  // Expect YYYY-MM-DD
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string; date: string }> }
) {
  // ⬇️ Next.js 15: params is a Promise — await it
  const { id, date } = await context.params;

  const body = await req.json().catch(() => null);
  const completed =
    typeof body?.completed === "boolean" ? body.completed : true;

  const day = isoToUTCDate(date);
  if (!day) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const rec = await prisma.habitRecord.upsert({
    where: { date_habitId: { date: day, habitId: id } },
    update: { completed },
    create: { habitId: id, date: day, completed },
  });

  return NextResponse.json(rec);
}
