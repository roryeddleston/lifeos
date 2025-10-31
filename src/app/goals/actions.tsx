"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createGoal as createGoalDb,
  updateGoalForUser,
  deleteGoalForUser,
} from "@/lib/goals";

const CreateGoalSchema = z.object({
  title: z.string().min(1),
  targetValue: z.number().positive(),
  unit: z.string().min(1),
  deadline: z
    .string()
    .datetime()
    .or(z.string().length(0))
    .nullable()
    .optional(),
  description: z.string().nullable().optional(),
});

const UpdateGoalSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  targetValue: z.number().finite().optional(),
  currentValue: z.number().finite().optional(),
  unit: z.string().min(1).optional(),
  deadline: z.string().datetime().or(z.null()).optional(),
});

export async function createGoal(input: unknown) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const data = CreateGoalSchema.parse(input);

  await createGoalDb({
    userId,
    title: data.title,
    targetValue: data.targetValue,
    unit: data.unit,
    deadline: data.deadline ? data.deadline : null,
    description: data.description ?? null,
  });

  revalidatePath("/goals");
  revalidatePath("/");
}

export async function updateGoal(id: string, input: unknown) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const data = UpdateGoalSchema.parse(input);

  await updateGoalForUser(userId, id, {
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.description !== undefined
      ? { description: data.description }
      : {}),
    ...(data.targetValue !== undefined
      ? { targetValue: data.targetValue }
      : {}),
    ...(data.currentValue !== undefined
      ? { currentValue: data.currentValue }
      : {}),
    ...(data.unit !== undefined ? { unit: data.unit } : {}),
    ...(data.deadline !== undefined ? { deadline: data.deadline } : {}),
  });

  revalidatePath("/goals");
  revalidatePath("/");
}

export async function deleteGoal(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await deleteGoalForUser(userId, id);
  revalidatePath("/goals");
  revalidatePath("/");
}
