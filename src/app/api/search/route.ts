// app/api/search/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { globalSearchForUser } from "@/lib/search";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  // short-circuit here too, to avoid hitting DB for 1-char searches
  if (q.length < 2) {
    return NextResponse.json(
      { tasks: [], habits: [], goals: [] },
      { status: 200 }
    );
  }

  try {
    const results = await globalSearchForUser(userId, q, 5);
    return NextResponse.json(results, { status: 200 });
  } catch (err) {
    console.error("Search error:", err);
    // return empty but 200 — your client already expects that
    return NextResponse.json(
      { tasks: [], habits: [], goals: [] },
      { status: 200 }
    );
  }
}
