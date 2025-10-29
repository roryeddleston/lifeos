"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const Status = z.enum(["TODO", "IN_PROGRESS", "DONE"]);

const UpdateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  dueDate: z.string().min(1).nullable().optional(), // "YYYY-MM-DD" or ISO or null
  status: Status.optional(),
  position: z.number().int().positive().optional(),
});

const CreateManySchema = z.object({
  tasks: z
    .array(
      z.object({
        title: z.string().min(1),
        dueDate: z.string().min(1).nullable().optional(),
      })
    )
    .min(1),
});

const ReorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      position: z.number().int().positive(),
    })
  ),
});

function toDateFromString(d?: string | null): Date | null {
  if (!d) return null;
  const s = d.trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(`${s}T00:00:00.000Z`);
  const ts = Date.parse(s);
  return Number.isNaN(ts) ? null : new Date(ts);
}

export async function createTasksBulk(input: unknown) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { tasks } = CreateManySchema.parse(input);

  const data = tasks.map((t) => ({
    userId,
    title: t.title,
    status: "TODO" as const,
    dueDate: toDateFromString(t.dueDate ?? null),
  }));

  // createMany for efficiency
  await prisma.task.createMany({ data });

  revalidatePath("/tasks");
  revalidatePath("/");
}

export async function updateTask(id: string, input: unknown) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const data = UpdateTaskSchema.parse(input);

  await prisma.task.update({
    where: { id, userId },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.position !== undefined ? { position: data.position } : {}),
      ...(data.dueDate !== undefined
        ? { dueDate: toDateFromString(data.dueDate ?? null) }
        : {}),
    },
  });

  revalidatePath("/tasks");
  revalidatePath("/");
}

export async function deleteTask(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.task.delete({ where: { id, userId } });

  revalidatePath("/tasks");
  revalidatePath("/");
}

export async function reorderTasks(input: unknown) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { items } = ReorderSchema.parse(input);

  await prisma.$transaction(
    items.map(({ id, position }) =>
      prisma.task.update({
        where: { id, userId },
        data: { position },
      })
    )
  );

  revalidatePath("/tasks");
  revalidatePath("/");
}
