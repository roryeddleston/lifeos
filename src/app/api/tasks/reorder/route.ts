import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/user";

// Accepts: { items: [{ id: string, position: number }, ...] }
export async function POST(req: Request) {
  const userId = await getUserId();
  const { items } = await req.json().catch(() => ({ items: [] as any[] }));

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "No items" }, { status: 400 });
  }

  await prisma.$transaction(
    items.map((i) =>
      prisma.task.update({
        where: { id: i.id },
        data: { position: Number(i.position) || 0, userId },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
