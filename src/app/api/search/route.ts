// src/app/api/search/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  // require at least 2 chars
  if (q.length < 2) {
    return NextResponse.json(
      { tasks: [], habits: [], goals: [] },
      { status: 200 }
    );
  }

  try {
    const [tasks, habits, goals] = await Promise.all([
      prisma.task.findMany({
        where: { title: { contains: q, mode: "insensitive" } },
        select: { id: true, title: true },
        orderBy: [{ createdAt: "desc" }],
        take: 5,
      }),
      prisma.habit.findMany({
        where: { name: { contains: q, mode: "insensitive" } },
        select: { id: true, name: true },
        orderBy: [{ createdAt: "desc" }],
        take: 5,
      }),
      prisma.goal.findMany({
        where: { title: { contains: q, mode: "insensitive" } },
        select: { id: true, title: true },
        orderBy: [{ createdAt: "desc" }],
        take: 5,
      }),
    ]);

    return NextResponse.json({ tasks, habits, goals });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json(
      { tasks: [], habits: [], goals: [] },
      { status: 200 }
    );
  }
}
