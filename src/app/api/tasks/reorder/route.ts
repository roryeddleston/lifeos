import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/user";
import { z } from "zod";

const ReorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        position: z.coerce.number().int().min(0),
      })
    )
    .min(1),
});

export async function POST(req: Request) {
  const userId = await getUserId();

  const parsed = ReorderSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const ids = parsed.data.items.map((i) => i.id);
  // Ownership guard: ensure all belong to user
  const owners = await prisma.task.findMany({
    where: { id: { in: ids }, userId },
    select: { id: true },
  });
  if (owners.length !== ids.length) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.$transaction(
    parsed.data.items.map((i) =>
      prisma.task.update({
        where: { id: i.id },
        data: { position: i.position },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
