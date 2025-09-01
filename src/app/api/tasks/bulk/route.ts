import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@prisma/client";
import { getUserId } from "@/lib/user";

/* ----------------- helpers & type guards ----------------- */

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

function parseDateLoose(input: string | null | undefined): Date | null {
  if (!input) return null;
  const s = input.trim();
  if (!s) return null;

  // Accept YYYY-MM-DD -> midnight UTC
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(`${s}T00:00:00.000Z`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const t = Date.parse(s);
  return Number.isNaN(t) ? null : new Date(t);
}

/* --------------------------- POST --------------------------- */

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Read once as text; if JSON parse fails, treat as plain text payload.
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

  // Trim & coerce to DB shape
  const titlesAndDates = incoming
    .map(({ title, dueDate }) => ({
      title: (title ?? "").trim(),
      dueDate: parseDateLoose(dueDate ?? null),
    }))
    .filter((t) => t.title.length > 0);

  if (titlesAndDates.length === 0) {
    return NextResponse.json({ error: "No valid tasks" }, { status: 400 });
  }

  // Compute next positions for this user
  const max = await prisma.task.aggregate({
    where: { userId },
    _max: { position: true },
  });
  const startPos = (max._max.position ?? 0) + 1;

  // Create and return rows (createMany doesn't return rows)
  const created = await prisma.$transaction(
    titlesAndDates.map((t, idx) =>
      prisma.task.create({
        data: {
          title: t.title,
          dueDate: t.dueDate,
          status: TaskStatus.TODO,
          position: startPos + idx,
          userId,
          // completedAt remains null for TODO
        },
        select: {
          id: true,
          title: true,
          status: true,
          dueDate: true,
          createdAt: true,
          position: true,
          completedAt: true,
        },
      })
    )
  );

  return NextResponse.json(
    { count: created.length, tasks: created },
    { status: 201 }
  );
}
