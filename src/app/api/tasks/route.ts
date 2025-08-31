import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/user";
import { z } from "zod";
import { TaskStatus } from "@prisma/client";
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

const CreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().trim().optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional().default("TODO"),
  // accept a variety, normalize manually
  dueDate: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
});

export async function GET() {
  const userId = await getUserId();
  try {
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        dueDate: true,
        position: true,
        createdAt: true,
        completedAt: true,
      },
    });
    return NextResponse.json(tasks);
  } catch (err) {
    console.error("GET /api/tasks failed", err);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const userId = await getUserId();

  let parsed: z.infer<typeof CreateSchema>;
  try {
    const json = await req.json().catch(() => ({}));
    parsed = CreateSchema.parse(json);
  } catch (e) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Append to bottom
  const max = await prisma.task.aggregate({
    where: { userId },
    _max: { position: true },
  });
  const nextPos = (max._max.position ?? 0) + 1;

  let due: Date | null = null;
  try {
    if (parsed.dueDate !== undefined) {
      due = normalizeToDate(parsed.dueDate ?? null);
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid dueDate. Use YYYY-MM-DD or ISO datetime." },
      { status: 400 }
    );
  }

  try {
    const created = await prisma.task.create({
      data: {
        title: parsed.title.trim(),
        description: parsed.description ?? null,
        status: parsed.status ?? "TODO",
        dueDate: due,
        position: nextPos,
        userId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        dueDate: true,
        position: true,
        createdAt: true,
      },
    });

    // SSR cache bust
    revalidatePath("/");
    revalidatePath("/tasks");

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/tasks failed", err);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
