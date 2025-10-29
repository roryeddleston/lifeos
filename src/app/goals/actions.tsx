"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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
  await prisma.goal.create({
    data: {
      userId,
      title: data.title,
      targetValue: data.targetValue,
      currentValue: 0,
      unit: data.unit,
      deadline: data.deadline ? new Date(data.deadline) : null,
    },
  });

  revalidatePath("/goals");
  revalidatePath("/");
}

export async function updateGoal(id: string, input: unknown) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const data = UpdateGoalSchema.parse(input);
  await prisma.goal.update({
    where: { id, userId },
    data: {
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
      ...(data.deadline !== undefined
        ? { deadline: data.deadline ? new Date(data.deadline) : null }
        : {}),
    },
  });

  revalidatePath("/goals");
  revalidatePath("/");
}

export async function deleteGoal(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.goal.delete({ where: { id, userId } });
  revalidatePath("/goals");
  revalidatePath("/");
}
