import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/user";
import { z } from "zod";

const CreateTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().trim().nullable().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional().default("TODO"),
  // accept ISO string or YYYY-MM-DD; we’ll normalize below
  dueDate: z.string().trim().nullable().optional(),
});

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

export async function GET() {
  const userId = await getUserId();
  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      dueDate: true,
      createdAt: true,
      position: true,
      completedAt: true,
    },
  });
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const userId = await getUserId();

  const json = await req.json().catch(() => ({}));
  const parsed = CreateTaskSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { title, description = null, status, dueDate } = parsed.data;

  // Next position per user
  const max = await prisma.task.aggregate({
    where: { userId },
    _max: { position: true },
  });
  const nextPos = (max._max.position ?? 0) + 1;

  let due: Date | null = null;
  try {
    due = normalizeToDate(dueDate ?? null);
  } catch {
    return NextResponse.json(
      { error: "Invalid dueDate. Use YYYY-MM-DD or ISO datetime." },
      { status: 400 }
    );
  }

  const created = await prisma.task.create({
    data: {
      title: title.trim(),
      description,
      status,
      dueDate: due,
      position: nextPos,
      userId,
      completedAt: status === "DONE" ? new Date() : null,
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      dueDate: true,
      createdAt: true,
      position: true,
      completedAt: true,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
