// lib/search.ts
import { prisma } from "./prisma";

export type GlobalSearchResult = {
  tasks: { id: string; title: string }[];
  habits: {
    id: string;
    name: string;
    // we keep completions minimal here; you can drop this if you don't show it
    completions: { date: Date; completed: boolean }[];
  }[];
  goals: { id: string; title: string }[];
};

export async function globalSearchForUser(
  userId: string,
  q: string,
  limitPerType = 5
): Promise<GlobalSearchResult> {
  const term = q.trim();
  if (term.length < 2) {
    return { tasks: [], habits: [], goals: [] };
  }

  const [tasks, habits, goals] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId,
        title: { contains: term, mode: "insensitive" },
      },
      select: { id: true, title: true },
      orderBy: [{ createdAt: "desc" }],
      take: limitPerType,
    }),
    prisma.habit.findMany({
      where: {
        userId,
        name: { contains: term, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
        completions: {
          select: {
            date: true,
            completed: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
      take: limitPerType,
    }),
    prisma.goal.findMany({
      where: {
        userId,
        title: { contains: term, mode: "insensitive" },
      },
      select: { id: true, title: true },
      orderBy: [{ createdAt: "desc" }],
      take: limitPerType,
    }),
  ]);

  return { tasks, habits, goals };
}
