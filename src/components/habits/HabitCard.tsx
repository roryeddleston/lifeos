"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/Toaster";
import InlineHabitName from "./InlineHabitName";

type HabitView = {
  id: string;
  name: string;
  // last 7 days, oldest -> newest
  timeline: { iso: string; completed: boolean }[];
  streak: number;
};

export default function HabitCard({ habit }: { habit: HabitView }) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [tiles, setTiles] = useState(habit.timeline);
  const [deleting, setDeleting] = useState(false);

  const todayIso = tiles[tiles.length - 1]?.iso;

  // optimistic toggle for a single day
  async function toggleDay(iso: string, next: boolean) {
    // optimistic update
    setTiles((curr) =>
      curr.map((d) => (d.iso === iso ? { ...d, completed: next } : d))
    );

    try {
      const res = await fetch(`/api/habits/${habit.id}/records/${iso}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: next }),
      });
      if (!res.ok) {
        // revert on failure
        setTiles((curr) =>
          curr.map((d) => (d.iso === iso ? { ...d, completed: !next } : d))
        );
        const text = await res.text().catch(() => "");
        console.error(
          "POST /api/habits/:id/records/:date failed:",
          res.status,
          text
        );
        toast({
          variant: "error",
          title: "Update failed",
          description: `HTTP ${res.status}`,
        });
        return;
      }
      // revalidate server view after optimistic change
      startTransition(() => router.refresh());
    } catch (e) {
      console.error(e);
      // revert on failure
      setTiles((curr) =>
        curr.map((d) => (d.iso === iso ? { ...d, completed: !next } : d))
      );
      toast({
        variant: "error",
        title: "Network error",
        description: "Please try again.",
      });
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/habits/${habit.id}`, { method: "DELETE" });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("DELETE /api/habits/:id failed:", res.status, text);
        toast({
          variant: "error",
          title: "Delete failed",
          description: `HTTP ${res.status}`,
        });
        return;
      }
      router.refresh();
      toast({ variant: "success", title: "Habit deleted" });
    } catch (e) {
      console.error(e);
      toast({
        variant: "error",
        title: "Network error",
        description: "Please try again.",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_17rem_2rem] items-center gap-4">
      {/* Left: editable name + streak */}
      <div className="min-w-0 flex items-center gap-2">
        <InlineHabitName id={habit.id} name={habit.name} />
        {habit.streak >= 2 && (
          <span
            className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
            title={`${habit.streak} day streak`}
          >
            {habit.streak} day{habit.streak > 1 ? "s" : ""} streak
          </span>
        )}
      </div>

      {/* Middle: fixed-width 7-day strip (must match header width) */}
      <div className="w-[17rem] shrink-0">
        <div className="grid grid-cols-7 gap-2">
          {tiles.map((d) => {
            const active = d.completed;
            const isToday = d.iso === todayIso;

            return (
              <button
                key={d.iso}
                type="button"
                onClick={() => toggleDay(d.iso, !d.completed)}
                className={[
                  "group relative inline-flex h-8 w-8 items-center justify-center rounded-md border transition",
                  "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-gray-300",
                  active
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-gray-200 bg-white hover:bg-gray-50",
                  isToday ? "ring-1 ring-gray-300" : "",
                ].join(" ")}
                aria-pressed={active}
                aria-label={`${d.iso} ${
                  active ? "completed" : "not completed"
                }`}
                title={d.iso}
                disabled={isPending}
              >
                {active ? (
                  <Check className="h-4 w-4 text-emerald-600 transition-transform group-active:scale-95" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
                {/* subtle today indicator dot */}
                {isToday && (
                  <span className="pointer-events-none absolute -top-1 right-1 h-1.5 w-1.5 rounded-full bg-gray-400/70" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: delete (fixed 2rem column) */}
      <div className="w-8 flex items-center justify-center">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
          aria-label="Delete habit"
          title="Delete habit"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
