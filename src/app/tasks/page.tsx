import { prisma } from "@/lib/prisma";
import Card from "@/components/cards/Card";
import RowActions from "./RowActions";
import QuickAdd from "@/components/tasks/QuickAdd";
import { formatDateGB } from "@/lib/date";

export const dynamic = "force-dynamic";

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    TODO: "bg-gray-100 text-gray-700",
    IN_PROGRESS: "bg-amber-100 text-amber-800",
    DONE: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span className={`px-2 py-1 text-xs rounded ${map[status] ?? ""}`}>
      {status}
    </span>
  );
}

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="p-6 space-y-6">
      {/* Task list */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Due</th>
                <th className="py-2 pr-4">Created</th>
                <th className="py-2 pr-0 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="py-3 pr-4">{t.title}</td>
                  <td className="py-3 pr-4">
                    <StatusPill status={t.status} />
                  </td>
                  <td className="py-3 pr-4">
                    {t.dueDate ? formatDateGB(t.dueDate) : "—"}
                  </td>
                  <td className="py-3 pr-4">{formatDateGB(t.createdAt)}</td>
                  <td className="py-3 pr-0 text-right">
                    <RowActions id={t.id} status={t.status} />
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">
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
