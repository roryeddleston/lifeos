import { prisma } from "./prisma";

// basic list (used by /api/habits and maybe dashboard)
export async function getHabitsForUser(userId: string) {
  return prisma.habit.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      createdAt: true,
      completions: {
        select: {
          date: true,
          completed: true,
        },
      },
    },
  });
}

// list with date window (used by /habits page to show last 7 days)
export async function getHabitsForUserInRange(
  userId: string,
  start: Date,
  end: Date
) {
  return prisma.habit.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      completions: {
        where: {
          date: {
            gte: start,
            lt: end,
          },
        },
        select: {
          date: true,
          completed: true,
        },
        orderBy: {
          date: "asc",
        },
      },
    },
  });
}

export async function getHabitByIdForUser(userId: string, id: string) {
  return prisma.habit.findFirst({
    where: { id, userId },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  });
}

export async function createHabitForUser(userId: string, name: string) {
  return prisma.habit.create({
    data: {
      userId,
      name,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  });
}

export async function updateHabitForUser(
  userId: string,
  id: string,
  data: { name?: string }
) {
  return prisma.habit.update({
    where: { id, userId },
    data,
    select: {
      id: true,
      name: true,
    },
  });
}

export async function deleteHabitForUser(userId: string, id: string) {
  return prisma.habit.delete({
    where: { id, userId },
  });
}

// used by /api/habits/[id]/history
export async function getHabitWithFullCompletions(userId: string, id: string) {
  return prisma.habit.findFirst({
    where: { id, userId },
    select: {
      id: true,
      name: true,
      completions: {
        orderBy: {
          date: "asc",
        },
        select: {
          date: true,
          completed: true,
        },
      },
    },
  });
}

// toggle / upsert a record for a specific date
export async function toggleHabitRecordForUser(
  userId: string,
  habitId: string,
  date: Date,
  explicit?: boolean
) {
  // ensure habit belongs to user
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId },
    select: { id: true },
  });
  if (!habit) {
    throw new Error("Habit not found");
  }

  const existing = await prisma.habitRecord.findUnique({
    where: {
      habitId_date: {
        habitId,
        date,
      },
    },
  });

  const nextCompleted =
    typeof explicit === "boolean" ? explicit : !Boolean(existing?.completed);

  return prisma.habitRecord.upsert({
    where: {
      habitId_date: {
        habitId,
        date,
      },
    },
    update: {
      completed: nextCompleted,
    },
    create: {
      habitId,
      date,
      completed: nextCompleted,
    },
    select: {
      id: true,
      habitId: true,
      date: true,
      completed: true,
    },
  });
}
