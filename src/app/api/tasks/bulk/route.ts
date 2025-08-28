import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/user";
import { z } from "zod";
import type { TaskStatus } from "@prisma/client";

// ----- Validation -----
const TaskInput = z.object({
  title: z.string().trim().min(1, "Title is required"),
  // ISO string or null; optional field
  dueDate: z.string().datetime().nullable().optional(),
});

const BodySchema = z.object({
  tasks: z.array(TaskInput),
});

export async function POST(req: Request) {
  const userId = await getUserId();

  // Parse & validate body safely (no `any`)
  const json: unknown = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(json);

  if (!parsed.success || parsed.data.tasks.length === 0) {
    return NextResponse.json({ error: "No valid tasks" }, { status: 400 });
  }

  // Get current max position for this user
  const max = await prisma.task.aggregate({
    where: { userId },
    _max: { position: true },
  });

  // Use const since we don't reassign later
  const pos = (max._max.position ?? 0) + 1;

  const statusTODO: TaskStatus = "TODO";

  // Build typed create payloads
  const data = parsed.data.tasks.map((t, i) => ({
    title: t.title.trim(),
    status: statusTODO,
    dueDate: t.dueDate ? new Date(t.dueDate) : null,
    position: pos + i, // increment position based on index
    userId,
  }));

  const created = await prisma.$transaction(
    data.map((d) => prisma.task.create({ data: d }))
  );

  return NextResponse.json(created, { status: 201 });
}
