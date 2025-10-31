// lib/goals.ts
import { prisma } from "./prisma";

export type CreateGoalInput = {
  userId: string;
  title: string;
  targetValue: number;
  unit: string;
  deadline?: string | Date | null;
  description?: string | null;
};

// list all goals for a user
export async function getGoalsForUser(userId: string) {
  return prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}

// get a single goal but make sure it belongs to the user
export async function getGoalByIdForUser(userId: string, id: string) {
  return prisma.goal.findFirst({
    where: { id, userId },
  });
}

// create a goal (DB-level)
export async function createGoal(input: CreateGoalInput) {
  const { userId, title, targetValue, unit, deadline, description } = input;

  return prisma.goal.create({
    data: {
      userId,
      title,
      targetValue,
      unit,
      description: description ?? null,
      deadline: deadline ? new Date(deadline) : null,
      currentValue: 0,
    },
  });
}

// update a goal but scoped to this user
export async function updateGoalForUser(
  userId: string,
  id: string,
  data: {
    title?: string;
    description?: string | null;
    targetValue?: number;
    currentValue?: number;
    unit?: string;
    deadline?: string | Date | null;
  }
) {
  // normalise deadline
  const { deadline, ...rest } = data;
  return prisma.goal.update({
    where: { id, userId },
    data: {
      ...rest,
      ...(typeof deadline !== "undefined"
        ? {
            deadline: deadline ? new Date(deadline) : null,
          }
        : {}),
    },
  });
}

// delete a goal but scoped to this user
export async function deleteGoalForUser(userId: string, id: string) {
  return prisma.goal.delete({
    where: { id, userId },
  });
}
