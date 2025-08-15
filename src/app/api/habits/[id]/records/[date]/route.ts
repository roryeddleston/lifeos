import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helpers for UTC date-only behavior
function startOfDayUTC(d = new Date()) {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}
function parseIsoDateUTC(iso: string) {
  // Expect YYYY-MM-DD
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

// POST /api/habits/:id/records/:date  { completed?: boolean }
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string; date: string }> }
) {
  try {
    const { id, date } = await ctx.params;

    const when = parseIsoDateUTC(date);
    if (!when)
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const hasExplicit = typeof body?.completed === "boolean";
    const explicit = hasExplicit ? Boolean(body.completed) : null;

    // Find existing record (date is stored UTC date-only in your schema)
    const existing = await prisma.habitRecord.findUnique({
      where: {
        date_habitId: {
          date: startOfDayUTC(when),
          habitId: id,
        },
      },
    });

    let completed: boolean;

    if (existing) {
      completed = hasExplicit ? explicit! : !existing.completed;
      await prisma.habitRecord.update({
        where: { id: existing.id },
        data: { completed },
      });
    } else {
      completed = hasExplicit ? explicit! : true; // default new click = complete
      await prisma.habitRecord.create({
        data: {
          habitId: id,
          date: startOfDayUTC(when),
          completed,
        },
      });
    }

    return NextResponse.json({ ok: true, habitId: id, date, completed });
  } catch (err) {
    console.error("POST /api/habits/[id]/records/[date] failed", err);
    return NextResponse.json(
      { error: "Failed to update habit record" },
      { status: 500 }
    );
  }
}
