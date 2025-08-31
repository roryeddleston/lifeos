import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/user";
import { z } from "zod";
import { revalidatePath } from "next/cache";

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

  const { items } = parsed.data;

  // Restrict updates to this user’s tasks
  await prisma.$transaction(
    items.map((i) =>
      prisma.task.update({
        where: { id: i.id, userId },
        data: { position: i.position },
        select: { id: true }, // tiny payload
      })
    )
  );

  revalidatePath("/tasks");

  return NextResponse.json({ ok: true });
}
