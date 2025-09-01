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
  // Require auth
  const userId = await getUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Validate payload
  const parsed = ReorderSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const items = parsed.data.items;
  const ids = items.map((i) => i.id);

  // Ownership guard: ensure all provided tasks belong to the current user
  const owned = await prisma.task.findMany({
    where: { id: { in: ids }, userId },
    select: { id: true },
  });
  if (owned.length !== ids.length) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Apply new positions
  await prisma.$transaction(
    items.map(({ id, position }) =>
      prisma.task.update({
        where: { id },
        data: { position },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
