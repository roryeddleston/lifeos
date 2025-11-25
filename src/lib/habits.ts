import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

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
  // If explicit is provided, we don't need to read the existing row.
  const useExplicit = typeof explicit === "boolean";

  try {
    let nextCompleted: boolean;

    if (useExplicit) {
      nextCompleted = explicit as boolean;
    } else {
      const existing = await prisma.habitRecord.findUnique({
        where: {
          habitId_date: {
            habitId,
            date,
          },
        },
        select: {
          completed: true,
        },
      });

      nextCompleted = !Boolean(existing?.completed);
    }

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
  } catch (err: unknown) {
    // If the habit doesn't exist or doesn't belong to the user,
    // the foreign key constraint will fail.
    // We keep the same external error message as before.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      (err.code === "P2003" || err.code === "P2025")
    ) {
      // P2003: foreign key constraint failed
      // P2025: record not found
      throw new Error("Habit not found");
    }
    throw err;
  }
}
