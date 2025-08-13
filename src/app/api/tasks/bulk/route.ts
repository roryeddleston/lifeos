import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type InTask = { title: string; dueDate?: string | null };

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { tasks: InTask[] };

    const clean = (body.tasks || [])
      .map((t) => ({
        title: (t.title || "").trim(),
        dueDate: t.dueDate ? new Date(t.dueDate) : null,
      }))
      .filter((t) => t.title.length >= 2);

    if (clean.length === 0) {
      return NextResponse.json({ error: "No valid tasks" }, { status: 400 });
    }

    const created = await prisma.$transaction(
      clean.map((data) =>
        prisma.task.create({ data: { ...data, status: "TODO" } })
      )
    );

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error("POST /api/tasks/bulk error:", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
