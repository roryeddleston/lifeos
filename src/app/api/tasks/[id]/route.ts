import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getUserId } from "@/lib/user";

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
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
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
      description: true,
      createdAt: true,
    },
  });

  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(task);
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const userId = await getUserId();
  const { id } = await params;
  const json = await req.json();

  const parsed = PatchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Ensure ownership
  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  const p = parsed.data;

  if (p.title !== undefined) data.title = p.title;
  if (p.position !== undefined) data.position = p.position;

  if (p.dueDate !== undefined) {
    try {
      data.dueDate = normalizeToDate(p.dueDate);
    } catch {
      return NextResponse.json(
        { error: "Invalid dueDate. Use YYYY-MM-DD or ISO datetime." },
        { status: 400 }
      );
    }
  }

  if (p.status !== undefined) {
    data.status = p.status;
    data.completedAt = p.status === "DONE" ? new Date() : null;
  }

  const updated = await prisma.task.update({
    where: { id },
    data,
    select: {
      id: true,
      title: true,
      status: true,
      dueDate: true,
      position: true,
      completedAt: true,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const userId = await getUserId();
  const { id } = await params;

  // Ensure ownership
  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
