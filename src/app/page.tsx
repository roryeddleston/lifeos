// src/app/page.tsx
import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";
import StatCardsServer from "@/components/dashboard/StatCardsServer";
import HabitStreakBarsServer from "@/components/dashboard/HabitStreakBarsServer";
import RecentlyCompletedServer from "@/components/dashboard/RecentlyCompletedServer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { userId } = await auth();
  if (!userId) return null;

  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      <Suspense
        fallback={
          <div
            className="h-28 w-full animate-pulse rounded-xl"
            style={{
              backgroundColor:
                "color-mix(in oklab, var(--twc-text) 6%, var(--twc-surface))",
            }}
          />
        }
      >
        <StatCardsServer />
      </Suspense>

      <Suspense
        fallback={
          <div
            className="h-48 w-full animate-pulse rounded-xl"
            style={{
              backgroundColor:
                "color-mix(in oklab, var(--twc-text) 6%, var(--twc-surface))",
            }}
          />
        }
      >
        <HabitStreakBarsServer />
      </Suspense>

      <Suspense
        fallback={
          <div
            className="h-40 w-full animate-pulse rounded-xl"
            style={{
              backgroundColor:
                "color-mix(in oklab, var(--twc-text) 6%, var(--twc-surface))",
            }}
          />
        }
      >
        <RecentlyCompletedServer />
      </Suspense>
    </div>
  );
}
