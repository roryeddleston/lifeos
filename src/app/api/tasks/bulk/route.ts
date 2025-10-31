// app/api/tasks/bulk/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createTasksBulkForUser } from "@/lib/tasks";

type IncomingTask = { title: string; dueDate?: string | null };

function isRecord(u: unknown): u is Record<string, unknown> {
  return typeof u === "object" && u !== null;
}
function isStringArray(u: unknown): u is string[] {
  return Array.isArray(u) && u.every((x) => typeof x === "string");
}
function isIncomingTaskArray(u: unknown): u is IncomingTask[] {
  return (
    Array.isArray(u) &&
    u.every(
      (t) =>
        isRecord(t) &&
        typeof t.title === "string" &&
        (t.dueDate === undefined ||
          t.dueDate === null ||
          typeof t.dueDate === "string")
    )
  );
}

function normalizeToList(body: unknown): IncomingTask[] {
  if (!isRecord(body)) return [];

  if (typeof body.title === "string") return [{ title: body.title }];
  if (isStringArray(body.titles)) return body.titles.map((t) => ({ title: t }));
  if (typeof body.text === "string") {
    return body.text
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((t) => ({ title: t }));
  }
  if (isIncomingTaskArray(body.tasks)) {
    return body.tasks.map((t) => ({
      title: t.title,
      dueDate: t.dueDate ?? null,
    }));
  }

  return [];
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bodyText = await req.text().catch(() => "");
  let parsed: unknown = null;
  try {
    parsed = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    parsed = bodyText ? { text: bodyText } : null;
  }

  if (!parsed) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const incoming = normalizeToList(parsed);
  if (incoming.length === 0) {
    return NextResponse.json({ error: "No valid tasks" }, { status: 400 });
  }

  const created = await createTasksBulkForUser(userId, incoming);

  return NextResponse.json(
    { count: created.length, tasks: created },
    { status: 201 }
  );
}
