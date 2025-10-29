// src/app/habits/actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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
  // Expect "YYYY-MM-DD"
  return new Date(`${iso}T00:00:00.000Z`);
}

export async function createHabit(input: unknown) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const data = CreateHabitSchema.parse(input);

  await prisma.habit.create({
    data: { userId, name: data.name },
  });

  revalidatePath("/habits");
  revalidatePath("/");
}

export async function updateHabit(id: string, input: unknown) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const data = UpdateHabitSchema.parse(input);

  await prisma.habit.update({
    where: { id, userId },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
    },
  });

  revalidatePath("/habits");
  revalidatePath("/");
}

export async function toggleHabitRecord(input: unknown) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const data = ToggleRecordSchema.parse(input);

  // Ensure the habit belongs to the user
  const habit = await prisma.habit.findFirst({
    where: { id: data.habitId, userId },
    select: { id: true },
  });
  if (!habit) throw new Error("Not found");

  const start = dayStartUTCFromISO(data.iso);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  // Find existing record for that day (avoid assuming a composite unique)
  const existing = await prisma.habitRecord.findFirst({
    where: { habitId: habit.id, date: { gte: start, lt: end } },
    select: { id: true },
  });

  if (existing) {
    await prisma.habitRecord.update({
      where: { id: existing.id },
      data: { completed: data.completed },
    });
  } else {
    await prisma.habitRecord.create({
      data: { habitId: habit.id, date: start, completed: data.completed },
    });
  }

  revalidatePath("/habits");
  revalidatePath("/");
}

export async function deleteHabit(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.habit.delete({
    where: { id, userId },
  });

  revalidatePath("/habits");
  revalidatePath("/");
}