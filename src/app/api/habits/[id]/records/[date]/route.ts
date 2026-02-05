import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { toggleHabitRecordForUser } from "@/lib/habits";
import { revalidateTag } from "next/cache";

type RouteParams = {
  params: Promise<{ id: string; date: string }>;
};

export async function POST(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, date } = await params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date param" }, { status: 400 });
  }

  // NOTE: if your DB stores date-only or UTC-midnight this is fine.
  // If you store local-day timestamps, consider normalizing in the lib layer.
  const when = new Date(`${date}T00:00:00.000Z`);

  let body: { completed?: boolean } | null = null;
  try {
    body = await req.json().catch(() => null);
  } catch {
    body = null;
  }

  const explicit =
    typeof body?.completed === "boolean" ? body.completed : undefined;

  try {
    const saved = await toggleHabitRecordForUser(userId, id, when, explicit);

    revalidateTag(`dashboard-metrics:${userId}`);

    return NextResponse.json(saved, { status: 200 });
  } catch (e) {
    console.error("POST /api/habits/[id]/records/[date] failed", e);
    return NextResponse.json(
      { error: "Failed to update habit record" },
      { status: 500 }
    );
  }
}
