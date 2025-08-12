"use client";

import { useState } from "react";
import QuickAdd from "./QuickAdd";
import RowActions from "./RowActions";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate: string | null; // ISO
  createdAt: string; // ISO
};

export default function TasksClient({ initial }: { initial: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initial);

  const addTasksOptimistic = (newOnes: Task[]) => {
    // put new ones on top like Todoist
    setTasks((curr) => [...newOnes, ...curr]);
  };

  const replaceTask = (tempId: string, real: Task) => {
    setTasks((curr) => curr.map((t) => (t.id === tempId ? real : t)));
  };

  const removeTask = (id: string) => {
    setTasks((curr) => curr.filter((t) => t.id !== id));
  };

  const markDoneLocal = (id: string) => {
    setTasks((curr) =>
      curr.map((t) => (t.id === id ? { ...t, status: "DONE" } : t))
    );
  };

  return (
    <div className="space-y-6">
      {/* Quick add like Todoist */}
      <QuickAdd
        onOptimisticAdd={addTasksOptimistic}
        onServerConfirm={replaceTask}
      />

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2 pr-4 pl-4">Title</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Due</th>
              <th className="py-2 pr-4">Created</th>
              <th className="py-2 pr-4 text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="py-3 pr-4 pl-4">{t.title}</td>
                <td className="py-3 pr-4">
                  <span
                    className={
                      t.status === "DONE"
                        ? "px-2 py-1 text-xs rounded bg-emerald-100 text-emerald-700"
                        : t.status === "IN_PROGRESS"
                        ? "px-2 py-1 text-xs rounded bg-amber-100 text-amber-800"
                        : "px-2 py-1 text-xs rounded bg-gray-100 text-gray-700"
                    }
                  >
                    {t.status}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}
                </td>
                <td className="py-3 pr-4">
                  {new Date(t.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 pr-4 text-right">
                  <RowActions id={t.id} status={t.status} />
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500">
                  No tasks yet — add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
