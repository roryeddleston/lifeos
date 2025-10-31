// app/habits/actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createHabitForUser,
  updateHabitForUser,
  deleteHabitForUser,
  toggleHabitRecordForUser,
} from "@/lib/habits";

const CreateHabitSchema = z.object({
  name: z.string().min(1),
});

const UpdateHabitSchema = z.object({
  name: z.string().min(1).optional(),
});

const ToggleRecordSchema = z.object({
  habitId: z.string().min(1),
  iso: z.string().min(10), // "YYYY-MM-DD"
  completed: z.boolean(),
});

function dayStartUTCFromISO(iso: string) {
  return new Date(`${iso}T00:00:00.000Z`);
}

export async function createHabit(input: unknown) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const data = CreateHabitSchema.parse(input);
  await createHabitForUser(userId, data.name);

  revalidatePath("/habits");
  revalidatePath("/");
}

export async function updateHabit(id: string, input: unknown) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const data = UpdateHabitSchema.parse(input);

  await updateHabitForUser(userId, id, {
    ...(data.name !== undefined ? { name: data.name } : {}),
  });

  revalidatePath("/habits");
  revalidatePath("/");
}

export async function toggleHabitRecord(input: unknown) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const data = ToggleRecordSchema.parse(input);

  const date = dayStartUTCFromISO(data.iso);

  await toggleHabitRecordForUser(userId, data.habitId, date, data.completed);

  revalidatePath("/habits");
  revalidatePath("/");
}

export async function deleteHabit(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await deleteHabitForUser(userId, id);

  revalidatePath("/habits");
  revalidatePath("/");
}
