import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ISO year-week helper (UTC-based)
function isoYearWeek(date: Date) {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  const year = d.getUTCFullYear();
  const week = String(weekNo).padStart(2, "0");
  return `${year}-W${week}`;
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const habit = await prisma.habit.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        records: {
          orderBy: { date: "asc" },
          select: { date: true, completed: true },
        },
      },
    });

    if (!habit) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Bucket by ISO week, compute completion %
    const buckets = new Map<string, { done: number; total: number }>();
    for (const r of habit.records) {
      const key = isoYearWeek(r.date);
      const bucket = buckets.get(key) ?? { done: 0, total: 0 };
      bucket.total += 1;
      if (r.completed) bucket.done += 1;
      buckets.set(key, bucket);
    }

    const keys = Array.from(buckets.keys()).sort();
    const series = keys.map((k) => {
      const b = buckets.get(k)!;
      const pct = b.total ? b.done / b.total : 0;
      return { week: k, pct }; // pct 0..1
    });

    return NextResponse.json({
      id: habit.id,
      name: habit.name,
      series,
      countWeeks: series.length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to load history" },
      { status: 500 }
    );
  }
}
