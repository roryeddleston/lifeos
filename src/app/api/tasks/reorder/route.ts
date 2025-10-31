// app/api/tasks/reorder/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { reorderTasksForUser } from "@/lib/tasks";

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
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = ReorderSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    await reorderTasksForUser(userId, parsed.data.items);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/tasks/reorder failed", e);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
