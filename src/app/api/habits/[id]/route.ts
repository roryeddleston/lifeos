import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

type RouteParams = { params: Promise<{ id: string }> };

const PatchSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200).optional(),
});

function jsonError(
  message: string,
  status = 400,
  extra?: Record<string, unknown>
) {
  return NextResponse.json({ error: message, ...(extra ?? {}) }, { status });
}

function isPrismaNotFound(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025"
  );
}

/* ----------------------------- GET ----------------------------- */
export async function GET(_req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return jsonError("Unauthorized", 401);

  const { id } = await params;

  try {
    const habit = await prisma.habit.findFirst({
      where: { id, userId },
      select: { id: true, name: true, createdAt: true },
    });

    if (!habit) return jsonError("Not found", 404);
    return NextResponse.json(habit, { status: 200 });
  } catch (e: unknown) {
    console.error("GET /api/habits/[id] failed:", e);
    return jsonError("Failed to fetch habit", 500);
  }
}

/* ---------------------------- PATCH ---------------------------- */
export async function PATCH(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return jsonError("Unauthorized", 401);

  const { id } = await params;

  let bodyUnknown: unknown;
  try {
    bodyUnknown = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = PatchSchema.safeParse(bodyUnknown);
  if (!parsed.success) {
    return jsonError("Validation error", 422, {
      issues: parsed.error.flatten(),
    });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;

  if (Object.keys(data).length === 0) {
    return jsonError("No valid fields to update", 400);
  }

  try {
    const updated = await prisma.habit.update({
      where: { id, userId },
      data,
      select: { id: true, name: true },
    });
    return NextResponse.json(updated, { status: 200 });
  } catch (e: unknown) {
    if (isPrismaNotFound(e)) {
      return jsonError("Habit not found", 404);
    }
    console.error("PATCH /api/habits/[id] failed:", e);
    return jsonError("Failed to update habit", 500);
  }
}

/* --------------------------- DELETE ---------------------------- */
export async function DELETE(_req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return jsonError("Unauthorized", 401);

  const { id } = await params;

  try {
    await prisma.habit.delete({
      where: { id, userId },
    });
    return new NextResponse(null, { status: 204 });
  } catch (e: unknown) {
    if (isPrismaNotFound(e)) {
      return jsonError("Habit not found", 404);
    }
    console.error("DELETE /api/habits/[id] failed:", e);
    return jsonError("Failed to delete habit", 500);
  }
}
