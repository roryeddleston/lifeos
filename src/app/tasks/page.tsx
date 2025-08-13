import { prisma } from "@/lib/prisma";
import Card from "@/components/cards/Card";
import RowActions from "./RowActions";
import RowComplete from "./RowComplete";
import QuickAdd from "@/components/tasks/QuickAdd";
import { formatDueLabel } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({
    orderBy: [
      { dueDate: { sort: "asc", nulls: "last" } as any },
      { createdAt: "asc" },
    ],
    select: {
      id: true,
      title: true,
      dueDate: true,
      status: true,
    },
  });

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Task list */}
      <Card className="border-0 !shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="py-2 pr-2 w-10"></th>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Due</th>
                <th className="py-2 pr-0 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => {
                const isDone = t.status === "DONE";
                const isOverdue =
                  !!t.dueDate &&
                  new Date(t.dueDate).setHours(0, 0, 0, 0) <
                    todayMidnight.getTime() &&
                  !isDone;

                return (
                  <tr
                    key={t.id}
                    className="border-b border-gray-200 last:border-0"
                  >
                    <td className="py-3 pr-2 align-middle">
                      <RowComplete id={t.id} completed={isDone} />
                    </td>
                    <td className="py-3 pr-4 align-middle capitalize">
                      <span
                        className={isDone ? "line-through text-gray-500" : ""}
                      >
                        {t.title}
                      </span>
                    </td>
                    <td
                      className={`py-3 pr-4 align-middle ${
                        isOverdue ? "text-red-600" : ""
                      }`}
                    >
                      {formatDueLabel(t.dueDate as any)}
                    </td>
                    <td className="py-3 pr-0 text-right align-middle">
                      <RowActions
                        id={t.id}
                        title={t.title}
                        dueDate={t.dueDate as any}
                      />
                    </td>
                  </tr>
                );
              })}

              {tasks.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">
                    No tasks yet — add a few below.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick add below the list */}
      <QuickAdd />
    </div>
  );
}
