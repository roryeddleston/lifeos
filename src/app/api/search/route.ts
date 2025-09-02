import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  // Require at least 2 characters to trigger search
  if (q.length < 2) {
    return NextResponse.json(
      { tasks: [], habits: [], goals: [] },
      { status: 200 }
    );
  }

  try {
    const [tasks, habits, goals] = await Promise.all([
      prisma.task.findMany({
        where: {
          userId,
          title: { contains: q, mode: "insensitive" },
        },
        select: { id: true, title: true },
        orderBy: [{ createdAt: "desc" }],
        take: 5,
      }),
      prisma.habit.findMany({
        where: {
          userId,
          name: { contains: q, mode: "insensitive" },
        },
        select: {
          id: true,
          name: true,
          completions: {
            select: {
              date: true,
              completed: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
        take: 5,
      }),
      prisma.goal.findMany({
        where: {
          userId,
          title: { contains: q, mode: "insensitive" },
        },
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
