import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import Card from "@/components/cards/Card";
import TasksTable from "../../components/tasks/TasksTable";
import QuickAdd from "@/components/tasks/QuickAddTask";
import Filters from "../../components/tasks/Filters";

export const dynamic = "force-dynamic";

type AllowedView = "all" | "today" | "week" | "nodate" | "done";

type PageProps = {
  searchParams: Promise<{ view?: string }>;
};

export default async function TasksPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) return null; // optionally redirect to sign-in page

  const { view: rawView } = await searchParams;
  const view = (rawView ?? "all").toLowerCase() as AllowedView;

  // Date helpers
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const addDays = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };

  // Base filter
  const where: Prisma.TaskWhereInput =
    view === "done"
      ? { status: "DONE", userId }
      : { status: { not: "DONE" }, userId };

  // View-specific filters
  if (view === "today") {
    where.dueDate = { gte: today, lt: addDays(1) };
  } else if (view === "week") {
    where.dueDate = { gte: today, lt: addDays(7) };
  } else if (view === "nodate") {
    where.dueDate = null;
  }

  const tasksDb = await prisma.task.findMany({
    where,
    orderBy: [
      { dueDate: { sort: "asc", nulls: "last" } as Prisma.SortOrderInput },
      { createdAt: "asc" as Prisma.SortOrder },
    ] as Prisma.TaskOrderByWithRelationInput[],
    select: {
      id: true,
      title: true,
      dueDate: true,
      status: true,
      position: true,
    },
  });

  const tasks = tasksDb.map((t) => ({
    ...t,
    dueDate: t.dueDate ? t.dueDate.toISOString().slice(0, 10) : null,
  }));

  return (
    <div className="px-4 md:px-6 py-6 space-y-8">
      <header className="px-1">
        <h2 className="text-2xl font-semibold tracking-tight">To-do&apos;s</h2>
      </header>

      <div>
        <Filters />
      </div>

      <Card className="border-0 !shadow-none">
        <section
          className="rounded-xl"
          style={{
            backgroundColor: "var(--twc-surface)",
            border: "none",
          }}
        >
          <div className="p-4">
            <TasksTable initial={tasks} view={view} />
          </div>
        </section>
      </Card>

      <QuickAdd />
    </div>
  );
}
