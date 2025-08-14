import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/user";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getUserId();
  const body = await req.json().catch(() => ({}));

  const data: any = {};
  if (typeof body.title === "string") data.title = body.title.trim();
  if (typeof body.status === "string") data.status = body.status;
  if (body.dueDate === null) data.dueDate = null;
  else if (typeof body.dueDate === "string")
    data.dueDate = new Date(body.dueDate);

  const updated = await prisma.task.update({
    where: { id: params.id },
    data,
  });

  // guard: ensure task belongs to user (cheap check)
  if (updated.userId && updated.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.task.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
