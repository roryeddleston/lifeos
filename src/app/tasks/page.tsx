import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import Card from "@/components/cards/Card";
import TasksTable from "../../components/tasks/TasksTable";
import QuickAdd from "@/components/tasks/QuickAddTask";
import Filters from "../../components/tasks/Filters";

export const dynamic = "force-dynamic";

type AllowedView = "all" | "today" | "week" | "nodate" | "done";

type PageProps = {
  // In App Router, searchParams is async now — model it as a Promise and await it.
  searchParams: Promise<{ view?: string }>;
};

export default async function TasksPage({ searchParams }: PageProps) {
  const { view: rawView } = await searchParams;
  const view = (rawView ?? "all").toLowerCase() as AllowedView;

  // Build date helpers (server)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const addDays = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };

  // Base WHERE: exclude DONE by default (except on "done" view)
  const where: Prisma.TaskWhereInput =
    view === "done" ? { status: "DONE" } : { status: { not: "DONE" } };

  // Additional view-specific filters
  if (view === "today") {
    where.dueDate = { gte: today, lt: addDays(1) };
  } else if (view === "week") {
    where.dueDate = { gte: today, lt: addDays(7) };
  } else if (view === "nodate") {
    where.dueDate = null;
  }
  // 'all' => no extra dueDate filter

  // Prisma query (dueDate is Date | null here)
  const tasksDb = await prisma.task.findMany({
    where,
    orderBy: [
      // Use proper Prisma types (no `any`)
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

  // Serialize for client components: dueDate -> "YYYY-MM-DD" | null
  const tasks = tasksDb.map((t) => ({
    ...t,
    dueDate: t.dueDate ? t.dueDate.toISOString().slice(0, 10) : null,
  }));

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="px-0 pt-4">
        <h2 className="text-2xl font-medium tracking-tight">To-do&apos;s</h2>
      </div>

      {/* Filters */}
      <div>
        <Filters />
      </div>

      {/* Table */}
      <Card className="border-0 !shadow-none">
        <section
          className="rounded-xl"
          style={{
            backgroundColor: "var(--twc-surface)",
            // keep single outline (avoid double)
            border: "none",
          }}
        >
          <div className="p-4">
            <TasksTable initial={tasks} view={view} />
          </div>
        </section>
      </Card>

      {/* Quick add */}
      <QuickAdd />
    </div>
  );
}
