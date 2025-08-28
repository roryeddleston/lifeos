"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";

export default function RowComplete({
  id,
  completed,
  onToggle,
}: {
  id: string;
  completed: boolean;
  onToggle?: (next: boolean) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle(next: boolean) {
    if (loading) return;
    setLoading(true);
    onToggle?.(next);
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next ? "DONE" : "TODO" }),
      });
      startTransition(() => router.refresh());
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className="inline-flex h-5 w-5 items-center justify-center rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2"
      onClick={() => toggle(!completed)}
      disabled={loading}
      aria-pressed={completed}
      aria-label={completed ? "Mark as not done" : "Mark as done"}
      title={completed ? "Mark as not done" : "Mark as done"}
      style={{
        border: "1px solid var(--twc-border)",
        backgroundColor: "var(--twc-surface)",
      }}
    >
      {completed ? (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--twc-accent)"
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
