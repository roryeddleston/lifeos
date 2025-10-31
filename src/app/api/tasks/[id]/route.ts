// app/api/tasks/[id]/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { TaskStatus } from "@prisma/client";
import { z } from "zod";
import {
  getTaskByIdForUser,
  updateTaskForUser,
  deleteTaskForUser,
} from "@/lib/tasks";

const PatchSchema = z.object({
  title: z.string().min(1).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  dueDate: z.union([z.string(), z.date(), z.null()]).optional(),
  position: z.number().int().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const task = await getTaskByIdForUser(userId, id);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(task);
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const json = await req.json().catch(() => ({}));

  const parsed = PatchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updated = await updateTaskForUser(userId, id, parsed.data);
  if (!updated)
    return NextResponse.json(
      { error: "Not found or unauthorized" },
      { status: 404 }
    );

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const ok = await deleteTaskForUser(userId, id);
  if (!ok)
    return NextResponse.json(
      { error: "Not found or unauthorized" },
      { status: 404 }
    );

  return new NextResponse(null, { status: 204 });
}
