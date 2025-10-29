import Card from "@/components/cards/Card";

export default async function HabitHistory({ id }: { id: string }) {
  // Server component placeholder to avoid client fetch/hydration.
  // You can later replace with a server-rendered chart fed by Prisma if desired.
  return (
    <Card
      title="Habit history"
      subtitle="Track your habit over time"
      className="border"
    >
      <div className="p-4 md:p-6 text-sm text-muted">
        <p className="mb-2 text-center font-medium">Not enough data just yet</p>
        <p className="text-center text-[13px] leading-snug">
          Once you’ve logged at least 4 weeks of completions, your habit history
          will be shown here.
        </p>
      </div>
    </Card>
  );
}
