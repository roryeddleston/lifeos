import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/user";

export async function POST(req: Request) {
  const userId = await getUserId();
  const { tasks } = await req.json().catch(() => ({ tasks: [] as any[] }));

  // Get current max position
  const max = await prisma.task.aggregate({
    where: { userId },
    _max: { position: true },
  });
  let pos = (max._max.position ?? 0) + 1;

  const data = (Array.isArray(tasks) ? tasks : []).map((t: any) => ({
    title: (t.title as string)?.trim() ?? "",
    status: "TODO",
    dueDate: t.dueDate ? new Date(t.dueDate) : null,
    position: pos++,
    userId,
  }));

  if (data.length === 0) {
    return NextResponse.json({ error: "No tasks" }, { status: 400 });
  }

  const created = await prisma.$transaction(
    data.map((d) => prisma.task.create({ data: d }))
  );

  return NextResponse.json(created, { status: 201 });
}
