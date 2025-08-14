"use client";

import { Check } from "lucide-react";
import { useState, startTransition } from "react";

type HabitCardProps = {
  habit: {
    id: string;
    name: string;
    timeline: { iso: string; completed: boolean }[];
    streak: number;
  };
};

export default function HabitCard({ habit }: HabitCardProps) {
  const [timeline, setTimeline] = useState(habit.timeline);
  const streak = habit.streak;

  const showStreak = streak >= 2;
  const streakLabel = `${streak} day streak`;

  const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  const toggleDay = async (iso: string, completed: boolean) => {
    setTimeline((curr) =>
      curr.map((d) => (d.iso === iso ? { ...d, completed: !completed } : d))
    );

    startTransition(async () => {
      await fetch(`/api/habits/${habit.id}/records/${iso}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
    });
  };

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Habit name & streak */}
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium tracking-tight truncate">
          {cap(habit.name)}
        </h3>
        {showStreak && (
          <span
            className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700"
            title="Current consecutive days including today"
            aria-label={streakLabel}
          >
            {streakLabel}
          </span>
        )}
      </div>

      {/* Timeline */}
      <div className="grid grid-cols-7 gap-2">
        {timeline.map((d) => (
          <button
            key={d.iso}
            onClick={() => toggleDay(d.iso, d.completed)}
            className={`w-8 h-8 rounded border flex items-center justify-center transition-colors ${
              d.completed
                ? "bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600"
                : "bg-white border-gray-300 hover:bg-gray-50"
            }`}
            aria-label={
              d.completed
                ? `Mark ${d.iso} incomplete`
                : `Mark ${d.iso} complete`
            }
          >
            {d.completed && <Check className="w-4 h-4" />}
          </button>
        ))}
      </div>
    </div>
  );
}
