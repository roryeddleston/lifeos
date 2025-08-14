import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/user";

export async function GET() {
  const userId = await getUserId();
  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const userId = await getUserId();
  const body = await req.json().catch(() => ({}));
  const { title, description = null, status = "TODO", dueDate = null } = body;

  // Choose next position (append to bottom)
  const max = await prisma.task.aggregate({
    where: { userId },
    _max: { position: true },
  });
  const nextPos = (max._max.position ?? 0) + 1;

  const created = await prisma.task.create({
    data: {
      title: (title as string)?.trim() ?? "",
      description,
      status,
      dueDate: dueDate ? new Date(dueDate) : null,
      position: nextPos,
      userId,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
