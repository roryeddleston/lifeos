import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.task.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await prisma.task.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error("DELETE /api/tasks/[id]", e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    // allow updating status and/or dueDate; you can narrow if you want
    const { status, dueDate, title } = body as {
      status?: "TODO" | "IN_PROGRESS" | "DONE";
      dueDate?: string | null;
      title?: string;
    };

    const data: any = {};
    if (status) data.status = status;
    if (typeof dueDate !== "undefined")
      data.dueDate = dueDate ? new Date(dueDate) : null;
    if (typeof title !== "undefined") data.title = title;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const updated = await prisma.task.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        title: true,
        status: true,
        dueDate: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (e) {
    console.error("PATCH /api/tasks/[id]", e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
