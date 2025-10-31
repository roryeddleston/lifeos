// app/api/tasks/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getTasksForUser, createTaskForUser } from "@/lib/tasks";
import { TaskStatus } from "@prisma/client";

// GET /api/tasks — get tasks for current user
export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tasks = await getTasksForUser(userId, {}, [
    { position: "asc" },
    { createdAt: "asc" },
  ]);

  return NextResponse.json(tasks);
}

// POST /api/tasks — create task
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const {
    title,
    description = null,
    status = "TODO",
    dueDate = null,
  } = body ?? {};

  if (!title || !String(title).trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const created = await createTaskForUser({
    userId,
    title: String(title),
    description,
    status: status as TaskStatus,
    dueDate,
  });

  return NextResponse.json(created, { status: 201 });
}
