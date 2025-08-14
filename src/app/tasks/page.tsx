import { prisma } from "@/lib/prisma";
import Card from "@/components/cards/Card";
import TasksTable from "./TasksTable";
import QuickAdd from "@/components/tasks/QuickAdd";
import Filters from "./Filters";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: { view?: string };
};

export default async function TasksPage({ searchParams }: PageProps) {
  const view = (searchParams?.view ?? "all").toLowerCase();

  // Build date helpers
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const addDays = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };

  // Base WHERE: exclude DONE by default (except on "done" view)
  const where: any = {};
  if (view !== "done") {
    where.status = { not: "DONE" };
  } else {
    where.status = "DONE";
  }

  // Additional view-specific filters
  if (view === "today") {
    where.dueDate = { gte: today, lt: addDays(1) };
  } else if (view === "week") {
    where.dueDate = { gte: today, lt: addDays(7) };
  } else if (view === "nodate") {
    where.dueDate = null;
  }
  // 'all' => no extra dueDate filter

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [
      { dueDate: { sort: "asc", nulls: "last" } as any }, // undated last
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
    <div className="p-6 space-y-4">
      <div>
        <Filters />
      </div>

      <Card className="border-0 !shadow-none">
        <section className="rounded-xl bg-white">
          <div className="p-4">
            <TasksTable initial={tasks} view={view} />
          </div>
        </section>
      </Card>

      <QuickAdd />
    </div>
  );
}
