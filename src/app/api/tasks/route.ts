import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(2),
  description: z.string().max(500).optional().or(z.literal("")),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
  dueDate: z.string().optional(), // ISO/string from form
});

export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const parsed = taskSchema.parse(data);

    const due = parsed.dueDate ? new Date(parsed.dueDate) : null;

    const task = await prisma.task.create({
      data: {
        title: parsed.title,
        description: parsed.description || null,
        status: parsed.status,
        dueDate: due,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: err.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
