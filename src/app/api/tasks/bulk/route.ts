import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@prisma/client";

type IncomingTask = { title: string; dueDate?: string | null };

// ---------- Type guards (no `any`) ----------
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

// Normalize any allowed body into IncomingTask[]
function normalizeToList(body: unknown): IncomingTask[] {
  if (!isRecord(body)) return [];

  // 1) Single title
  if (typeof body.title === "string") {
    return [{ title: body.title }];
  }

  // 2) Array of titles
  if (isStringArray(body.titles)) {
    return body.titles.map((t) => ({ title: t }));
  }

  // 3) Multiline text block
  if (typeof body.text === "string") {
    return body.text
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((t) => ({ title: t }));
  }

  // 4) Full task objects
  if (isIncomingTaskArray(body.tasks)) {
    return body.tasks.map((t) => ({
      title: t.title,
      dueDate: t.dueDate ?? null,
    }));
  }

  return [];
}

export async function POST(req: Request) {
  // Read the body once as text; try JSON parse, else treat as plain text.
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

  // Trim + coerce to DB shape
  const toCreate = incoming
    .map(({ title, dueDate }) => ({
      title: (title ?? "").trim(),
      dueDate: dueDate ? new Date(dueDate) : null,
      status: TaskStatus.TODO,
      position: 0,
      userId: null, // TODO: replace with real user scoping if you add auth
    }))
    .filter((t) => t.title.length > 0);

  if (toCreate.length === 0) {
    return NextResponse.json({ error: "No valid tasks" }, { status: 400 });
  }

  // Return created rows (createMany doesn't return rows)
  const created = await prisma.$transaction(
    toCreate.map((data) =>
      prisma.task.create({
        data,
        select: {
          id: true,
          title: true,
          status: true,
          dueDate: true,
          createdAt: true,
          position: true,
          // completedAt stays null for TODO tasks (set when marking DONE)
        },
      })
    )
  );

  return NextResponse.json(
    { count: created.length, tasks: created },
    { status: 201 }
  );
}
