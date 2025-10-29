// src/components/dashboard/RecentlyCompletedServer.tsx
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Card from "@/components/cards/Card";
import { formatDateGB } from "@/lib/date";

export default async function RecentlyCompletedServer() {
  const { userId } = await auth();
  if (!userId) return null;

  const tasks = await prisma.task.findMany({
    where: { userId, status: "DONE", completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
    take: 5,
    select: { id: true, title: true, completedAt: true },
  });

  return (
    <Card className="p-4">
      <h3
        className="mb-3 text-sm font-medium"
        style={{ color: "var(--twc-text)" }}
      >
        Recently completed tasks
      </h3>

      {tasks.length === 0 ? (
        <div className="text-sm" style={{ color: "var(--twc-muted)" }}>
          Nothing completed yet.
        </div>
      ) : (
        <ul className="divide-y" style={{ borderColor: "var(--twc-border)" }}>
          {tasks.map((t) => (
            <li key={t.id} className="py-2">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate" style={{ color: "var(--twc-text)" }}>
                  {t.title}
                </span>
                <span
                  className="shrink-0 text-xs tabular-nums"
                  style={{ color: "var(--twc-muted)" }}
                  title={
                    t.completedAt ? new Date(t.completedAt).toISOString() : ""
                  }
                >
                  {t.completedAt
                    ? formatDateGB(new Date(t.completedAt).toISOString())
                    : ""}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
