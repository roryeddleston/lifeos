import { prisma, Prisma } from "@/lib/prisma";
import Card from "@/components/cards/Card";
import TasksTable from "../../components/tasks/TasksTable";
import QuickAdd from "@/components/tasks/QuickAdd";
import Filters from "../../components/tasks/Filters";

export const dynamic = "force-dynamic";

type AllowedView = "all" | "today" | "week" | "nodate" | "done";

type PageProps = {
  searchParams: Promise<{ view?: string }>;
};

export default async function TasksPage({ searchParams }: PageProps) {
  const { view: rawView } = await searchParams;
  const view = (rawView ?? "all").toLowerCase() as AllowedView;

  // Build date helpers
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

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [
      { dueDate: { sort: "asc", nulls: "last" } as any },
      { createdAt: "asc" },
    ],
    select: {
      id: true,
      title: true,
      dueDate: true,
      status: true,
      position: true,
    },
  });

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
            // 🚀 removed border so no more double outline
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
