import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/user";
import { z } from "zod";
import { Prisma } from "@prisma/client";

/** Next App Router pattern: params is a Promise and must be awaited */
type RouteParams = { params: Promise<{ id: string }> };

/* ---------------------- Validation Schemas ---------------------- */

const PatchSchema = z.object({
  // rename only (extend later if needed)
  name: z.string().trim().min(1, "Name is required").max(200).optional(),
});

/* --------------------------- Helpers --------------------------- */

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
/** Fetch a single habit for the current user (minimal fields for UI) */
export async function GET(_req: Request, { params }: RouteParams) {
  const userId = await getUserId();
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
/** Update habit — currently supports rename via { name } */
export async function PATCH(req: Request, { params }: RouteParams) {
  const userId = await getUserId();
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
    // Ensure it belongs to the user
    const exists = await prisma.habit.findFirst({ where: { id, userId } });
    if (!exists) return jsonError("Habit not found", 404);

    const updated = await prisma.habit.update({
      where: { id },
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
/**
 * Delete a habit for the current user.
 * Your Prisma schema uses `onDelete: Cascade` on HabitRecord → Habit,
 * so associated HabitRecord rows are removed automatically.
 */
export async function DELETE(_req: Request, { params }: RouteParams) {
  const userId = await getUserId();
  const { id } = await params;

  try {
    // Ensure it belongs to the user
    const exists = await prisma.habit.findFirst({ where: { id, userId } });
    if (!exists) return jsonError("Habit not found", 404);

    await prisma.habit.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e: unknown) {
    if (isPrismaNotFound(e)) {
      return jsonError("Habit not found", 404);
    }
    console.error("DELETE /api/habits/[id] failed:", e);
    return jsonError("Failed to delete habit", 500);
  }
}
