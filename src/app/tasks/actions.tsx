// app/tasks/actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createTaskForUser,
  updateTaskForUser,
  deleteTaskForUser,
  createTasksBulkForUser,
  reorderTasksForUser,
} from "@/lib/tasks";

const Status = z.enum(["TODO", "IN_PROGRESS", "DONE"]);

const UpdateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  dueDate: z.string().min(1).nullable().optional(),
  status: Status.optional(),
  position: z.number().int().min(0).optional(),
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
      position: z.number().int().min(0),
    })
  ),
});

export async function createTasksBulk(input: unknown) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { tasks } = CreateManySchema.parse(input);

  await createTasksBulkForUser(
    userId,
    tasks.map((t) => ({
      title: t.title,
      dueDate: t.dueDate ?? null,
    }))
  );

  revalidatePath("/tasks");
  revalidatePath("/");
}

export async function updateTask(id: string, input: unknown) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const data = UpdateTaskSchema.parse(input);

  const updated = await updateTaskForUser(userId, id, {
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.status !== undefined ? { status: data.status } : {}),
    ...(data.position !== undefined ? { position: data.position } : {}),
    ...(data.dueDate !== undefined ? { dueDate: data.dueDate } : {}),
  });

  if (!updated) throw new Error("Not found");

  revalidatePath("/tasks");
  revalidatePath("/");
}

export async function deleteTask(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ok = await deleteTaskForUser(userId, id);
  if (!ok) throw new Error("Not found");

  revalidatePath("/tasks");
  revalidatePath("/");
}

export async function reorderTasks(input: unknown) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { items } = ReorderSchema.parse(input);

  await reorderTasksForUser(userId, items);

  revalidatePath("/tasks");
  revalidatePath("/");
}
