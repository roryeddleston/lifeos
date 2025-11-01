import { auth } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { getRecentlyCompletedTasksForUser } from "@/lib/tasks";

export const runtime = "nodejs";

type RecentTask = {
  id: string;
  title: string;
  completedAt: string;
};

export default async function RecentlyCompletedServer() {
  noStore(); // always fetch fresh
  const { userId } = await auth();
  if (!userId) return null;

  // explicitly typed so TS doesn’t infer any[]
  let items: RecentTask[] = [];
  try {
    items = await getRecentlyCompletedTasksForUser(userId, 5);
  } catch {
    items = [];
  }

  const hasAny = items.length > 0;

  return (
    <section
      className="rounded-xl border"
      style={{
        borderColor: "var(--twc-border)",
        backgroundColor: "var(--twc-surface)",
      }}
    >
      <div className="p-8">
        <div className="flex items-center justify-between">
          <h3
            className="text-lg font-bold"
            style={{ color: "var(--twc-text)" }}
          >
            Recently completed
          </h3>
        </div>

        {!hasAny ? (
          <div
            className="mt-6 rounded-lg p-4 text-center"
            style={{
              border: "1px solid var(--twc-border)",
              backgroundColor:
                "color-mix(in oklab, var(--twc-text) 4%, var(--twc-surface))",
              color: "var(--twc-muted)",
            }}
          >
            Nothing completed yet — check something off!
          </div>
        ) : (
          <ul className="mt-3" role="list">
            {items.map((t, idx) => (
              <li
                key={t.id}
                className="py-2.5"
                style={{
                  borderBottom:
                    idx === items.length - 1
                      ? "none"
                      : "1px solid color-mix(in oklab, var(--twc-text) 10%, transparent)",
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div
                    className="min-w-0 truncate text-sm"
                    style={{ color: "var(--twc-text)" }}
                  >
                    {t.title}
                  </div>
                  <time
                    dateTime={t.completedAt}
                    className="shrink-0 text-xs"
                    style={{ color: "var(--twc-muted)" }}
                  >
                    {new Date(t.completedAt).toLocaleDateString("en-GB", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
