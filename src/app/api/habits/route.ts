import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/user";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// GET /api/habits — small, and scoped
export async function GET() {
  const userId = await getUserId();
  try {
    const habits = await prisma.habit.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, createdAt: true },
    });
    return NextResponse.json(habits);
  } catch (err) {
    console.error("GET /api/habits failed", err);
    return NextResponse.json(
      { error: "Failed to fetch habits" },
      { status: 500 }
    );
  }
}

const CreateHabit = z.object({ name: z.string().min(1) });

// POST /api/habits — scoped
export async function POST(req: Request) {
  const userId = await getUserId();

  const json = await req.json().catch(() => ({}));
  const parsed = CreateHabit.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  try {
    const created = await prisma.habit.create({
      data: { name: parsed.data.name.trim(), userId },
      select: { id: true, name: true, createdAt: true },
    });

    revalidatePath("/");
    revalidatePath("/habits");

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/habits failed", err);
    return NextResponse.json(
      { error: "Failed to create habit" },
      { status: 500 }
    );
  }
}
