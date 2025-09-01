// src/lib/authz.ts
import { NextResponse } from "next/server";
import { getUserId } from "@/lib/user";

/** Returns the current user's id or a 401 JSON response if unauthenticated. */
export async function requireUserIdOrJson(): Promise<string | NextResponse> {
  const uid = await getUserId();
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return uid;
}
