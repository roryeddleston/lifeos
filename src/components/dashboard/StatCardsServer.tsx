import { auth } from "@clerk/nextjs/server";
import StatCardRow from "./StatCardRow";
import { getDashboardMetrics } from "@/lib/dashboard";

export default async function StatCardsServer() {
  const { userId } = await auth();
  if (!userId) return null;

  const metrics = await getDashboardMetrics(userId);

  return <StatCardRow metrics={metrics} />;
}
