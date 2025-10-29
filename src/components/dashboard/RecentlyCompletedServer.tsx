// src/components/dashboard/RecentlyCompletedServer.tsx
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Card from "@/components/cards/Card";

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
      <div
        className="mb-3 text-sm font-medium"
        style={{ color: "var(--twc-text)" }}
      >
        Recently Completed Tasks
      </div>
      {tasks.length === 0 ? (
        <div className="text-sm" style={{ color: "var(--twc-muted)" }}>
          Nothing completed yet.
        </div>
      ) : (
        <ul className="divide-y" style={{ borderColor: "var(--twc-border)" }}>
          {tasks.map((t) => (
            <li key={t.id} className="py-2">
              <div className="flex items-center justify-between">
                <span className="truncate" style={{ color: "var(--twc-text)" }}>
                  {t.title}
                </span>
                <span
                  className="ml-3 shrink-0 text-xs tabular-nums"
                  style={{ color: "var(--twc-muted)" }}
                >
                  {t.completedAt?.toISOString().slice(0, 16).replace("T", " ")}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
