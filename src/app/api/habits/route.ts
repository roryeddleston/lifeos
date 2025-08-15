import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/habits
// Keep it small: id, name, createdAt. (Your /habits page does its own windowed fetch.)
export async function GET() {
  try {
    const habits = await prisma.habit.findMany({
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

// POST /api/habits
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!name)
      return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const created = await prisma.habit.create({
      data: { name },
      select: { id: true, name: true, createdAt: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/habits failed", err);
    return NextResponse.json(
      { error: "Failed to create habit" },
      { status: 500 }
    );
  }
}
