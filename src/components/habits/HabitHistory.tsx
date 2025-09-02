"use client";

import { useEffect } from "react";
import Card from "@/components/cards/Card";

export default function HabitHistory({ id }: { id: string }) {
  useEffect(() => {
    (async () => {
      try {
        await fetch(`/api/habits/${id}/history`, {
          cache: "no-store",
        });
      } catch {
        // Ignore errors
      }
    })();
  }, [id]);

  return (
    <Card
      title="Habit history"
      subtitle="Track your habit over time"
      className="border"
    >
      <div className="p-4 md:p-6 text-sm text-muted">
        <p className="mb-2 font-medium text-center">Not enough data just yet</p>
        <p className="text-center text-[13px] leading-snug">
          Once you’ve logged at least 4 weeks of completions, your habit history
          will be shown here.
        </p>
      </div>
    </Card>
  );
}
