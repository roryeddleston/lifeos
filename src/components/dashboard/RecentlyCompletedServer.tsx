import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Card from "@/components/cards/Card";
import Link from "next/link";
import { formatDateGB } from "@/lib/date";

type Row = { id: string; title: string; completedAt: Date | null };

export default async function RecentlyCompletedServer() {
  const { userId } = await auth();
  if (!userId) return null;

  let tasks: Row[] = [];

  try {
    tasks = await prisma.$queryRaw<Row[]>`
      SELECT "id", "title", "completedAt"
      FROM "Task"
      WHERE "userId" = ${userId}
        AND "status" = 'DONE'
        AND "completedAt" IS NOT NULL
      ORDER BY "completedAt" DESC
      LIMIT 5
    `;
  } catch {
    tasks = [];
  }

  return (
    <Card className="p-4">
      <div className="mb-3">
        <h3 className="text-md font-bold" style={{ color: "var(--twc-text)" }}>
          Recently completed
        </h3>
        <p className="mt-3 text-sm" style={{ color: "var(--twc-muted)" }}>
          Most recent 5 tasks you finished
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="text-sm" style={{ color: "var(--twc-muted)" }}>
          Nothing completed yet.
        </div>
      ) : (
        <>
          <ul className="divide-y pt-4 divide-[var(--twc-border)]">
            {tasks.map((t) => (
              <li key={t.id} className="py-1.5">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="truncate text-[14px] leading-5"
                    style={{ color: "var(--twc-text)" }}
                  >
                    {t.title}
                  </span>
                  <span
                    className="shrink-0 text-xs tabular-nums"
                    style={{ color: "var(--twc-muted)" }}
                    title={t.completedAt ? t.completedAt.toISOString() : ""}
                  >
                    {t.completedAt
                      ? formatDateGB(t.completedAt.toISOString())
                      : ""}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-3 text-right">
            <Link
              href="/tasks?view=done"
              className="text-sm"
              style={{ color: "var(--twc-accent)" }}
            >
              View all completed
            </Link>
          </div>
        </>
      )}
    </Card>
  );
}
