import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCardsServer from "@/components/dashboard/StatCardsServer";
import GoalProgressServer from "@/components/dashboard/GoalProgressServer";
import RecentlyCompletedServer from "@/components/dashboard/RecentlyCompletedServer";
import ComingSoon from "@/components/dashboard/ComingSoon";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { userId } = await auth();
  if (!userId) return null;

  return (
    <div className="px-4 py-6 md:px-6 space-y-8">
      <DashboardHeader />

      <Suspense
        fallback={
          <div
            className="h-24 rounded-xl animate-pulse"
            style={{
              backgroundColor:
                "color-mix(in oklab, var(--twc-text) 6%, var(--twc-surface))",
            }}
          />
        }
      >
        <StatCardsServer />
      </Suspense>

      {/* Chart-sized skeleton */}
      <Suspense
        fallback={
          <div
            className="h-48 rounded-xl animate-pulse"
            style={{
              backgroundColor:
                "color-mix(in oklab, var(--twc-text) 6%, var(--twc-surface))",
            }}
          />
        }
      >
        <GoalProgressServer />
      </Suspense>

      {/* List-sized skeleton */}
      <Suspense
        fallback={
          <div
            className="h-40 rounded-xl animate-pulse"
            style={{
              backgroundColor:
                "color-mix(in oklab, var(--twc-text) 6%, var(--twc-surface))",
            }}
          />
        }
      >
        <RecentlyCompletedServer />
      </Suspense>

      <ComingSoon />
    </div>
  );
}
