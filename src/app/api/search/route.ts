import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/user";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const userId = await getUserId();

  if (q.length < 2) {
    return NextResponse.json({ tasks: [], habits: [], goals: [] });
  }

  // Simple ilike; relies on your indexes for small datasets (OK for now).
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
}
