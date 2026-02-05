"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/components/ui/Toaster";
import InlineHabitName from "./InlineHabitName";
import HabitHistory from "./HabitHistory";
import TrashButton from "@/components/ui/TrashButton";

type HabitView = {
  id: string;
  name: string;
  timeline: { iso: string; completed: boolean }[];
  streak: number;
};

function loginRedirect() {
  if (typeof window !== "undefined") {
    const returnTo = window.location.pathname + window.location.search;
    window.location.href = `/api/auth/login?returnTo=${encodeURIComponent(
      returnTo
    )}`;
  }
}

async function apiFetch(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  if (res.status === 401) {
    loginRedirect();
    throw new Error("Unauthorized");
  }
  return res;
}

export default function HabitCard({ habit }: { habit: HabitView }) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [tiles, setTiles] = useState(habit.timeline);
  const [deleting, setDeleting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const todayIso = tiles[tiles.length - 1]?.iso;

  async function toggleDay(iso: string, next: boolean) {
    setTiles((curr) =>
      curr.map((d) => (d.iso === iso ? { ...d, completed: next } : d))
    );

    try {
      const res = await apiFetch(`/api/habits/${habit.id}/records/${iso}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: next }),
      });

      if (!res.ok) {
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

      startTransition(() => router.refresh());
    } catch (err) {
      if ((err as Error).message !== "Unauthorized") {
        console.error(err);
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
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await apiFetch(`/api/habits/${habit.id}`, {
        method: "DELETE",
      });
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
    } catch (err) {
      if ((err as Error).message !== "Unauthorized") {
        console.error(err);
        toast({
          variant: "error",
          title: "Network error",
          description: "Please try again.",
        });
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-2">
      {/* Mobile: stack. Desktop: two columns. */}
      <div className="flex flex-col gap-2 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4">
        {/* Top row: name (+ streak on sm+) */}
        <div className="min-w-0 flex items-center gap-2">
          <InlineHabitName id={habit.id} name={habit.name} />

          {habit.streak >= 2 && (
            <span
              className="hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
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
        </div>

        {/* Actions + 7-day grid row (on mobile sits beneath title) */}
        <div className="flex items-center justify-between gap-2 sm:justify-start">
          {/* Left: History button */}
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition-colors cursor-pointer hover:border-[var(--twc-accent)] hover:bg-[color-mix(in_oklab,var(--twc-surface)_95%,var(--twc-accent)_5%)]"
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

          {/* Right: day tiles + trash */}
          <div className="flex items-center gap-2">
            <div className="overflow-auto">
              <div className="min-w-[14rem] sm:min-w-[16rem] grid grid-cols-7 gap-1 sm:gap-2">
                {tiles.map((d) => {
                  const active = d.completed;
                  const isToday = d.iso === todayIso;
                  return (
                    <button
                      key={d.iso}
                      type="button"
                      onClick={() => toggleDay(d.iso, !d.completed)}
                      className="group relative inline-flex h-8 w-8 items-center justify-center rounded-md transition cursor-pointer outline-none focus-visible:ring-2"
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
                          className="h-1.5 w-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
              </div>
            </div>

            <div className="w-8 flex items-center justify-center shrink-0">
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
