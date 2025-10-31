import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getGoalByIdForUser,
  updateGoalForUser,
  deleteGoalForUser,
} from "@/lib/goals";

type GoalUpdateBody = Partial<{
  title: string;
  unit: string;
  deadline: string | null;
  targetValue: number | string;
  currentValue: number | string;
  description: string | null;
}>;

// PATCH /api/goals/:id — partial update
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as GoalUpdateBody;

    // make sure goal belongs to this user
    const existing = await getGoalByIdForUser(userId, id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};

    if (typeof body.title === "string") data.title = body.title.trim();
    if (typeof body.unit === "string") data.unit = body.unit.trim();
    if (typeof body.description === "string")
      data.description = body.description.trim();

    if (body.deadline === null) {
      data.deadline = null;
    } else if (typeof body.deadline === "string" && body.deadline) {
      data.deadline = body.deadline;
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
      // clamp to target if we know it
      const targetToClamp =
        typeof data.targetValue === "number"
          ? data.targetValue
          : existing.targetValue;
      cv = Math.max(0, Math.min(cv, targetToClamp));
      data.currentValue = cv;
    }

    const updated = await updateGoalForUser(userId, id, data);
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
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;

    // ensure it belongs to this user
    const existing = await getGoalByIdForUser(userId, id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await deleteGoalForUser(userId, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to delete goal" },
      { status: 500 }
    );
  }
}
