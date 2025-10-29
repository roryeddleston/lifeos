"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/components/ui/Toaster";
import InlineHabitName from "./InlineHabitName";
import HabitHistory from "./HabitHistory";
import TrashButton from "@/components/ui/TrashButton";
import { toggleHabitRecord, deleteHabit } from "@/app/habits/actions";

type HabitView = {
  id: string;
  name: string;
  timeline: { iso: string; completed: boolean }[]; // last 7 days
  streak: number;
};

export default function HabitCard({ habit }: { habit: HabitView }) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [tiles, setTiles] = useState(habit.timeline);
  const [deleting, setDeleting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const todayIso = tiles[tiles.length - 1]?.iso;

  function toggleDay(iso: string, next: boolean) {
    // optimistic update
    setTiles((curr) =>
      curr.map((d) => (d.iso === iso ? { ...d, completed: next } : d))
    );
    startTransition(async () => {
      try {
        await toggleHabitRecord({ habitId: habit.id, iso, completed: next });
        router.refresh();
      } catch (e) {
        // rollback
        setTiles((curr) =>
          curr.map((d) => (d.iso === iso ? { ...d, completed: !next } : d))
        );
        toast({
          variant: "error",
          title: "Update failed",
          description: "Please try again.",
        });
      }
    });
  }

  function handleDelete() {
    setDeleting(true);
    startTransition(async () => {
      try {
        await deleteHabit(habit.id);
        router.refresh();
        toast({ variant: "success", title: "Habit deleted" });
      } catch (e) {
        toast({
          variant: "error",
          title: "Delete failed",
          description: "Please try again.",
        });
      } finally {
        setDeleting(false);
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col items-start gap-2 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-4">
        <div className="min-w-0 flex items-center gap-2">
          <InlineHabitName id={habit.id} name={habit.name} />

          {habit.streak >= 2 && (
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              title={`${habit.streak} day streak`}
              style={{
                backgroundColor:
                  "color-mix(in oklab, var(--twc-accent) 12%, var(--twc-surface))",
                color: "var(--twc-text)",
                border: "1px solid var(--twc-border)",
              }}
            >
              {habit.streak} day streak
            </span>
          )}

          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="ml-1 inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[11px] transition-colors hover:border-[var(--twc-accent)] hover:bg-[color-mix(in_oklab,var(--twc-surface)_95%,var(--twc-accent)_5%)]"
            title="Show history"
            style={{
              border: "1px solid var(--twc-border)",
              backgroundColor: "var(--twc-surface)",
              color: "var(--twc-text)",
            }}
          >
            {showHistory ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            History
          </button>
        </div>

        <div className="overflow-auto py-3 md:py-0">
          <div className="grid min-w-[16rem] grid-cols-8 gap-2">
            {tiles.map((d) => {
              const active = d.completed;
              const isToday = d.iso === todayIso;
              return (
                <button
                  key={d.iso}
                  type="button"
                  onClick={() => toggleDay(d.iso, !d.completed)}
                  className="group relative inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition outline-none focus-visible:ring-2"
                  style={{
                    border: `1px solid ${
                      active
                        ? "color-mix(in oklab, var(--twc-accent) 18%, var(--twc-border))"
                        : "var(--twc-border)"
                    }`,
                    backgroundColor: active
                      ? "color-mix(in oklab, var(--twc-accent) 6%, var(--twc-surface))"
                      : "var(--twc-surface)",
                    boxShadow: isToday
                      ? "inset 0 0 0 1px color-mix(in oklab, var(--twc-text) 14%, transparent)"
                      : undefined,
                  }}
                  aria-pressed={active}
                  aria-label={`${d.iso} ${
                    active ? "completed" : "not completed"
                  }`}
                  title={d.iso}
                  disabled={isPending}
                >
                  {active ? (
                    <Check
                      className="h-4 w-4"
                      style={{ color: "var(--twc-accent)" }}
                    />
                  ) : (
                    <span
                      className="h-1.5 w-1.5 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ backgroundColor: "var(--twc-border)" }}
                    />
                  )}
                  {isToday && (
                    <span
                      className="pointer-events-none absolute -top-1 right-1 h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          "color-mix(in oklab, var(--twc-text) 35%, transparent)",
                      }}
                    />
                  )}
                </button>
              );
            })}

            <div className="flex w-8 items-center justify-center">
              <TrashButton
                onClick={handleDelete}
                disabled={deleting}
                aria-label="Delete habit"
                title="Delete habit"
              />
            </div>
          </div>
        </div>
      </div>

      {showHistory && (
        <div className="px-0">
          <HabitHistory id={habit.id} />
        </div>
      )}
    </div>
  );
}
