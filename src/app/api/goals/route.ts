import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createGoal, getGoalsForUser } from "@/lib/goals";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const goals = await getGoalsForUser(userId);
    return NextResponse.json(goals);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, targetValue, unit, deadline, description } = body ?? {};

    if (!title || !String(title).trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const target = Number(targetValue);
    if (!Number.isFinite(target) || target <= 0) {
      return NextResponse.json(
        { error: "targetValue must be > 0" },
        { status: 400 }
      );
    }

    if (!unit || !String(unit).trim()) {
      return NextResponse.json({ error: "Unit is required" }, { status: 400 });
    }

    const created = await createGoal({
      userId,
      title: String(title).trim(),
      targetValue: target,
      unit: String(unit).trim(),
      deadline: deadline ?? null,
      description: description ?? null,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 }
    );
  }
}
