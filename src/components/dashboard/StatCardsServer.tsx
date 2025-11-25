import StatCardRow from "./StatCardRow";
import { getDashboardMetrics } from "@/lib/dashboard";

export default async function StatCardsServer({ userId }: { userId: string }) {
  const metrics = await getDashboardMetrics(userId);

  return <StatCardRow metrics={metrics} />;
}
