import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { TaskStatus } from "@prisma/client";

/** Accepts YYYY-MM-DD, full ISO string, Date, or null; returns Date|null or throws */
function normalizeToDate(input: unknown): Date | null {
  if (input === null || input === undefined || input === "") return null;

  // Already a Date?
  if (input instanceof Date && !Number.isNaN(input.getTime())) return input;

  if (typeof input === "string") {
    const s = input.trim();
    if (!s) return null;

    // If YYYY-MM-DD, assume midnight UTC
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const d = new Date(`${s}T00:00:00.000Z`);
      if (!Number.isNaN(d.getTime())) return d;
    }

    // Otherwise try generic parse (ISO, RFC, etc.)
    const t = Date.parse(s);
    if (!Number.isNaN(t)) return new Date(t);
  }

  throw new Error("Invalid date");
}

// Zod schema: do NOT use .datetime(); accept string | Date | null.
const PatchSchema = z.object({
  title: z.string().min(1).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  dueDate: z.union([z.string(), z.date(), z.null()]).optional(),
  position: z.number().int().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: RouteParams) {
  const { id } = await params;
  const json = await req.json();

  // Validate shape (but not date format)
  const parsed = PatchSchema.parse(json);

  const data: Record<string, unknown> = {};

  if (parsed.title !== undefined) data.title = parsed.title;
  if (parsed.position !== undefined) data.position = parsed.position;

  if (parsed.dueDate !== undefined) {
    try {
      data.dueDate = normalizeToDate(parsed.dueDate);
    } catch {
      return NextResponse.json(
        { error: "Invalid dueDate. Use YYYY-MM-DD or ISO datetime." },
        { status: 400 }
      );
    }
  }

  if (parsed.status !== undefined) {
    data.status = parsed.status;
    // Keep completedAt in sync with status
    data.completedAt = parsed.status === "DONE" ? new Date() : null;
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
  const { id } = await params;
  await prisma.task.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}

export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const task = await prisma.task.findUnique({
    where: { id },
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
