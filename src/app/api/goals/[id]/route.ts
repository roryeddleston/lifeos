import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserIdOrJson } from "@/lib/authz";

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

type RouteParams = { params: Promise<{ id: string }> };

/** GET /api/goals/:id — fetch one goal (scoped to user) */
export async function GET(_req: Request, { params }: RouteParams) {
  const uid = await requireUserIdOrJson();
  if (uid instanceof NextResponse) return uid;

  const { id } = await params;

  const goal = await prisma.goal.findFirst({
    where: { id, userId: uid },
  });

  if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(goal);
}

/** PATCH /api/goals/:id — partial update */
export async function PATCH(req: Request, { params }: RouteParams) {
  const uid = await requireUserIdOrJson();
  if (uid instanceof NextResponse) return uid;

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as GoalUpdateBody;

  const data: GoalUpdatePayload = {};

  if (typeof body.title === "string") data.title = body.title.trim();
  if (typeof body.unit === "string") data.unit = body.unit.trim();

  if (body.deadline === null) {
    data.deadline = null;
  } else if (typeof body.deadline === "string" && body.deadline) {
    const d = new Date(body.deadline);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: "Invalid deadline" }, { status: 400 });
    }
    data.deadline = d;
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
    // If targetValue included in this PATCH, clamp to it; otherwise at least 0
    if (typeof data.targetValue === "number") {
      cv = Math.max(0, Math.min(cv, data.targetValue));
    } else {
      cv = Math.max(0, cv);
    }
    data.currentValue = cv;
  }

  // Scope update to user
  const updated = await prisma.goal.update({
    where: { id, userId: uid },
    data,
  });

  return NextResponse.json(updated);
}

/** DELETE /api/goals/:id — delete (scoped to user) */
export async function DELETE(_req: Request, { params }: RouteParams) {
  const uid = await requireUserIdOrJson();
  if (uid instanceof NextResponse) return uid;

  const { id } = await params;

  await prisma.goal.delete({
    where: { id, userId: uid },
  });

  return NextResponse.json({ ok: true });
}
