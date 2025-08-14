import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const habits = await prisma.habit.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(habits);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }
  const habit = await prisma.habit.create({ data: { name } });
  return NextResponse.json(habit, { status: 201 });
}
