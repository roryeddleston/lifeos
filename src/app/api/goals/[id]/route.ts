import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Shape of the fields we allow updating on a Goal
type GoalUpdatePayload = Partial<{
  title: string;
  unit: string;
  deadline: Date | null;
  targetValue: number;
  currentValue: number;
}>;

// Shape of the incoming JSON (deadline arrives as string | null)
type GoalUpdateBody = Partial<{
  title: string;
  unit: string;
  deadline: string | null;
  targetValue: number | string;
  currentValue: number | string;
}>;

// PATCH /api/goals/:id — partial update
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> } // params can be async in Next 14/15
) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as GoalUpdateBody;

    const data: GoalUpdatePayload = {};

    if (typeof body.title === "string") data.title = body.title.trim();
    if (typeof body.unit === "string") data.unit = body.unit.trim();

    if (body.deadline === null) {
      data.deadline = null;
    } else if (typeof body.deadline === "string" && body.deadline) {
      data.deadline = new Date(body.deadline);
    }

    if (typeof body.targetValue !== "undefined") {
      const tv = Number(body.targetValue);
      if (!Number.isFinite(tv) || tv <= 0) {
        return NextResponse.json(
          { error: "targetValue must be > 0" },
          { status: 400 }
        );
      }
      data.targetValue = tv;
    }

    if (typeof body.currentValue !== "undefined") {
      let cv = Number(body.currentValue);
      if (!Number.isFinite(cv)) {
        return NextResponse.json(
          { error: "currentValue must be a number" },
          { status: 400 }
        );
      }
      // Clamp to [0, targetValue] if target provided; else >= 0
      if (typeof data.targetValue === "number") {
        cv = Math.max(0, Math.min(cv, data.targetValue));
      } else {
        cv = Math.max(0, cv);
      }
      data.currentValue = cv;
    }

    const updated = await prisma.goal.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update goal" },
      { status: 500 }
    );
  }
}

// DELETE /api/goals/:id — delete
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    await prisma.goal.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to delete goal" },
      { status: 500 }
    );
  }
}
