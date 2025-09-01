import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/user";
import { z } from "zod";

const CreateGoalSchema = z.object({
  title: z.string().min(1),
  description: z.string().trim().nullable().optional(),
  targetValue: z.coerce.number().int().positive(),
  unit: z.string().min(1),
  deadline: z.string().trim().nullable().optional(), // ISO or YYYY-MM-DD
});

function normalizeToDate(input: unknown): Date | null {
  if (input === null || input === undefined || input === "") return null;
  if (typeof input === "string") {
    const s = input.trim();
    if (!s) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const d = new Date(`${s}T00:00:00.000Z`);
      if (!Number.isNaN(d.getTime())) return d;
    }
    const t = Date.parse(s);
    if (!Number.isNaN(t)) return new Date(t);
  }
  throw new Error("Invalid date");
}

export async function GET() {
  const userId = await getUserId();
  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(goals);
}

export async function POST(req: Request) {
  const userId = await getUserId();
  const json = await req.json().catch(() => ({}));
  const parsed = CreateGoalSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  let deadline: Date | null = null;
  try {
    deadline = normalizeToDate(parsed.data.deadline ?? null);
  } catch {
    return NextResponse.json(
      { error: "Invalid deadline. Use YYYY-MM-DD or ISO datetime." },
      { status: 400 }
    );
  }

  const created = await prisma.goal.create({
    data: {
      title: parsed.data.title.trim(),
      description: parsed.data.description ?? null,
      targetValue: parsed.data.targetValue,
      currentValue: 0,
      unit: parsed.data.unit.trim(),
      deadline,
      userId,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
