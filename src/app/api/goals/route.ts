import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/goals — list goals
export async function GET() {
  try {
    const goals = await prisma.goal.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(goals);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}

// POST /api/goals — create goal
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, targetValue, unit, deadline } = body ?? {};

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

    const created = await prisma.goal.create({
      data: {
        title: String(title).trim(),
        targetValue: target,
        unit: String(unit).trim(),
        deadline: deadline ? new Date(deadline) : null,
        // currentValue defaults to 0 in schema
      },
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
