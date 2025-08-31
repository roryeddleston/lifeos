import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { TaskStatus } from "@prisma/client";
import { getUserId } from "@/lib/user";
import { revalidatePath } from "next/cache";

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

// Zod schema: do NOT use .datetime(); accept string | Date | null.
const PatchSchema = z.object({
  title: z.string().min(1).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  dueDate: z.union([z.string(), z.date(), z.null()]).optional(),
  position: z.number().int().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: RouteParams) {
  const userId = await getUserId();
  const { id } = await params;

  let parsed: z.infer<typeof PatchSchema>;
  try {
    const json = await req.json();
    parsed = PatchSchema.parse(json);
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

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
    data.completedAt = parsed.status === "DONE" ? new Date() : null;
  }

  try {
    const updated = await prisma.task.update({
      where: { id, userId },
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

    revalidatePath("/");
    revalidatePath("/tasks");

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/tasks/[id] failed", err);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const userId = await getUserId();
  const { id } = await params;

  try {
    await prisma.task.delete({ where: { id, userId } });

    revalidatePath("/");
    revalidatePath("/tasks");

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/tasks/[id] failed", err);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function GET(_req: Request, { params }: RouteParams) {
  const userId = await getUserId();
  const { id } = await params;

  try {
    const task = await prisma.task.findUnique({
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
    if (!task)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(task);
  } catch (err) {
    console.error("GET /api/tasks/[id] failed", err);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
