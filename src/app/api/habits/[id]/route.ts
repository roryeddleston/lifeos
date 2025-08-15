import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/habits/:id
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> } // keep Next’s “await params” warning happy
) {
  try {
    const { id } = await ctx.params;

    // Remove child records first (FK-safe), then delete habit
    await prisma.habitRecord.deleteMany({ where: { habitId: id } });
    await prisma.habit.delete({ where: { id } });

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("DELETE /api/habits/[id] failed", err);
    return NextResponse.json(
      { error: "Failed to delete habit" },
      { status: 500 }
    );
  }
}

// PATCH /api/habits/:id  { name: string }
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (!name)
      return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const updated = await prisma.habit.update({
      where: { id },
      data: { name },
      select: { id: true, name: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/habits/[id] failed", err);
    return NextResponse.json(
      { error: "Failed to update habit" },
      { status: 500 }
    );
  }
}
