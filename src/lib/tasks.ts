// lib/tasks.ts
import { prisma } from "./prisma";
import { TaskStatus, Prisma } from "@prisma/client";

function normalizeDate(input: unknown): Date | null {
  if (input === null || input === undefined || input === "") return null;
  if (input instanceof Date && !Number.isNaN(input.getTime())) return input;
  if (typeof input === "string") {
    const s = input.trim();
    if (!s) return null;
    // "YYYY-MM-DD"
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const d = new Date(`${s}T00:00:00.000Z`);
      if (!Number.isNaN(d.getTime())) return d;
    }
    const t = Date.parse(s);
    if (!Number.isNaN(t)) return new Date(t);
  }
  throw new Error("Invalid date");
}

// ------------ basic queries ------------

export async function getTasksForUser(
  userId: string,
  where: Prisma.TaskWhereInput = {},
  orderBy: Prisma.TaskOrderByWithRelationInput[] = [
    { position: "asc" },
    { createdAt: "asc" },
  ]
) {
  return prisma.task.findMany({
    where: { userId, ...where },
    orderBy,
  });
}

export async function getTaskByIdForUser(userId: string, id: string) {
  return prisma.task.findFirst({
    where: { id, userId },
  });
}

// ------------ create ------------

export async function createTaskForUser(input: {
  userId: string;
  title: string;
  description?: string | null;
  status?: TaskStatus;
  dueDate?: string | Date | null;
}) {
  const {
    userId,
    title,
    description = null,
    status = "TODO",
    dueDate = null,
  } = input;

  // get next position
  const max = await prisma.task.aggregate({
    where: { userId },
    _max: { position: true },
  });
  const nextPos = (max._max.position ?? 0) + 1;

  return prisma.task.create({
    data: {
      userId,
      title: title.trim(),
      description,
      status,
      dueDate: dueDate ? normalizeDate(dueDate) : null,
      position: nextPos,
    },
  });
}

// ------------ update ------------

export async function updateTaskForUser(
  userId: string,
  id: string,
  data: {
    title?: string;
    status?: TaskStatus;
    dueDate?: string | Date | null;
    position?: number;
  }
) {
  const toUpdate: Prisma.TaskUpdateInput = {};

  if (typeof data.title === "string") {
    toUpdate.title = data.title.trim();
  }

  if (typeof data.position === "number") {
    toUpdate.position = data.position;
  }

  if (typeof data.dueDate !== "undefined") {
    toUpdate.dueDate = data.dueDate ? normalizeDate(data.dueDate) : null;
  }

  if (typeof data.status !== "undefined") {
    toUpdate.status = data.status;
    // mirror your old behaviour: set completedAt when DONE
    toUpdate.completedAt = data.status === "DONE" ? new Date() : null;
  }

  // updateMany to preserve the “must belong to user” guard
  const res = await prisma.task.updateMany({
    where: { id, userId },
    data: toUpdate,
  });

  if (res.count === 0) return null;

  return prisma.task.findFirst({ where: { id, userId } });
}

// ------------ delete ------------

export async function deleteTaskForUser(userId: string, id: string) {
  const res = await prisma.task.deleteMany({
    where: { id, userId },
  });
  return res.count > 0;
}

// ------------ bulk create ------------

type IncomingTask = { title: string; dueDate?: string | null };

export async function createTasksBulkForUser(
  userId: string,
  items: IncomingTask[]
) {
  if (items.length === 0) return [];

  // find current max position
  const max = await prisma.task.aggregate({
    where: { userId },
    _max: { position: true },
  });
  let currentPos = (max._max.position ?? 0) + 1;

  const toCreate = items
    .map((t) => {
      const title = t.title?.trim?.() ?? "";
      if (!title) return null;
      return {
        userId,
        title,
        status: TaskStatus.TODO,
        dueDate: t.dueDate ? normalizeDate(t.dueDate) : null,
        position: currentPos++,
      };
    })
    .filter(Boolean) as Array<{
    userId: string;
    title: string;
    status: TaskStatus;
    dueDate: Date | null;
    position: number;
  }>;

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
        },
      })
    )
  );

  return created;
}

// ------------ reorder ------------

export async function reorderTasksForUser(
  userId: string,
  items: Array<{ id: string; position: number }>
) {
  // ensure ownership
  const ids = items.map((i) => i.id);
  const owned = await prisma.task.findMany({
    where: { id: { in: ids }, userId },
    select: { id: true },
  });
  if (owned.length !== ids.length) {
    throw new Error("Forbidden");
  }

  await prisma.$transaction(
    items.map(({ id, position }) =>
      prisma.task.update({
        where: { id },
        data: { position },
      })
    )
  );
}

// ------------ dashboard: recently completed ------------

export async function getRecentlyCompletedTasksForUser(
  userId: string,
  limit = 5
) {
  const rows = await prisma.task.findMany({
    where: { userId, status: "DONE" },
    orderBy: [
      { completedAt: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
    ],
    take: limit,
    select: { id: true, title: true, completedAt: true, createdAt: true },
  });

  return rows.map((r) => {
    const when = r.completedAt ?? r.createdAt;
    return { id: r.id, title: r.title, completedAt: when.toISOString() };
  });
}
