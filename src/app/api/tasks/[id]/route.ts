import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@prisma/client";
import { z } from "zod";
import { getUserId } from "@/lib/user";

/** Accepts YYYY-MM-DD, full ISO string, Date, or null; returns Date|null or throws */
function normalizeToDate(input: unknown): Date | null {
  if (input === null || input === undefined || input === "") return null;
  if (input instanceof Date && !Number.isNaN(input.getTime())) return input;
  if (typeof input === "string") {
    const s = input.trim();
    if (!s) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const d = new Date(`${s}T00:00:00.000Z`);
      if (!Number.isNaN(d.getTime())) return d;
    }
    const t = Date.parse(s);
    if (!Number.isNaN(t)) return new Date(t);
  }
  throw new Error("Invalid date");
}

const PatchSchema = z.object({
  title: z.string().min(1).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  dueDate: z.union([z.string(), z.date(), z.null()]).optional(),
  position: z.number().int().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const userId = await getUserId();
  const { id } = await params;

  const task = await prisma.task.findFirst({
    where: { id, userId },
    select: {
      id: true,
      title: true,
      status: true,
      dueDate: true,
      position: true,
      completedAt: true,
    },
  });

  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(task);
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const userId = await getUserId();
  const { id } = await params;
  const json = await req.json();

  const parsed = PatchSchema.parse(json);

  const data: Record<string, unknown> = {};
  if (parsed.title !== undefined) data.title = parsed.title;
  if (parsed.position !== undefined) data.position = parsed.position;

  if (parsed.dueDate !== undefined) {
    try {
      data.dueDate = normalizeToDate(parsed.dueDate);
    } catch {
      return NextResponse.json({ error: "Invalid dueDate" }, { status: 400 });
    }
  }

  if (parsed.status !== undefined) {
    data.status = parsed.status;
    data.completedAt = parsed.status === "DONE" ? new Date() : null;
  }

  const updated = await prisma.task.updateMany({
    where: { id, userId },
    data,
  });

  if (updated.count === 0)
    return NextResponse.json(
      { error: "Not found or unauthorized" },
      { status: 404 }
    );

  const task = await prisma.task.findUnique({ where: { id } });

  return NextResponse.json(task);
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const userId = await getUserId();
  const { id } = await params;

  const deleted = await prisma.task.deleteMany({ where: { id, userId } });

  if (deleted.count === 0)
    return NextResponse.json(
      { error: "Not found or unauthorized" },
      { status: 404 }
    );

  return new NextResponse(null, { status: 204 });
}
