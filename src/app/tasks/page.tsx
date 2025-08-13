import React from "react";
import { prisma } from "@/lib/prisma";
import Card from "@/components/cards/Card";
import QuickAdd from "@/components/tasks/QuickAdd";
import Filters from "./Filters";
import TasksTable from "./TasksTable";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: { view?: string };
};

export default async function TasksPage({ searchParams }: PageProps) {
  const view = (searchParams?.view ?? "all").toLowerCase();

  // Build filter for initial load
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const addDays = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };

  const where: any = {};

  // Date filters
  if (view === "today") {
    where.dueDate = { gte: today, lt: addDays(1) };
  } else if (view === "week") {
    where.dueDate = { gte: today, lt: addDays(7) };
  } else if (view === "nodate") {
    where.dueDate = null;
  }

  // Status filter: only include DONE on the "done" view
  if (view === "done") {
    where.status = "DONE";
  } else {
    where.status = { not: "DONE" };
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [
      { dueDate: { sort: "asc", nulls: "last" } as any }, // undated last
      { createdAt: "asc" }, // newest at bottom of group
    ],
    select: {
      id: true,
      title: true,
      dueDate: true,
      status: true,
    },
  });

  return (
    <div className="p-6 space-y-1">
      <div className="flex items-center justify-between">
        <Filters />
      </div>

      <Card className="border-0 !shadow-none">
        <TasksTable initial={tasks} view={view} />
      </Card>

      <QuickAdd />
    </div>
  );
}
