import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/user";

export async function GET(req: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  if (q.length < 2) {
    // Short queries return empty buckets (cheap and predictable)
    return NextResponse.json({ tasks: [], habits: [], goals: [] });
  }

  try {
    const [tasks, habits, goals] = await Promise.all([
      prisma.task.findMany({
        where: { userId, title: { contains: q, mode: "insensitive" } },
        select: { id: true, title: true },
        take: 8,
      }),
      prisma.habit.findMany({
        where: { userId, name: { contains: q, mode: "insensitive" } },
        select: { id: true, name: true },
        take: 8,
      }),
      prisma.goal.findMany({
        where: { userId, title: { contains: q, mode: "insensitive" } },
        select: { id: true, title: true },
        take: 8,
      }),
    ]);

    return NextResponse.json({ tasks, habits, goals });
  } catch (e) {
    console.error("GET /api/search failed:", e);
    return NextResponse.json(
      { error: "Search failed. Please try again." },
      { status: 500 }
    );
  }
}
