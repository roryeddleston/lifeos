"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

export default function RowComplete({
  id,
  completed,
  onToggle,
}: {
  id: string;
  completed: boolean;
  onToggle?: (next: boolean) => void; // allow parent to optimistically remove
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle(next: boolean) {
    if (loading) return;
    setLoading(true);

    // Optimistic update in parent (remove/move item from the current list)
    onToggle?.(next);

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next ? "DONE" : "TODO" }),
      });
      if (!res.ok) {
        // Re-fetch to sync if server failed
        startTransition(() => router.refresh());
      } else {
        // Light refresh to keep server in sync (positions, etc.)
        startTransition(() => router.refresh());
      }
    } catch {
      startTransition(() => router.refresh());
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className="inline-flex h-5 w-5 items-center justify-center rounded border border-gray-300 hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      aria-pressed={completed}
      aria-label={completed ? "Mark as not done" : "Mark as done"}
      title={completed ? "Mark as not done" : "Mark as done"}
      onClick={() => toggle(!completed)}
      disabled={loading}
    >
      {completed ? (
        // simple checkmark
        <svg
          className="h-4 w-4 text-emerald-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        <span className="sr-only">Mark complete</span>
      )}
    </button>
  );
}
