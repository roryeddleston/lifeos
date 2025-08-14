"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";

export default function HabitRow({
  id,
  name,
  completed,
}: {
  id: string;
  name: string;
  completed: boolean;
}) {
  const [checked, setChecked] = useState(completed);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function toggle() {
    setBusy(true);
    // optimistic
    setChecked((c) => !c);
    try {
      const res = await fetch(`/api/habits/${id}/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !checked }),
      });
      if (!res.ok) {
        // revert if failed
        setChecked((c) => !c);
      } else {
        startTransition(() => router.refresh());
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="px-4 py-3 flex items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-pressed={checked}
        aria-label={checked ? "Mark incomplete" : "Mark complete"}
        className={`h-5 w-5 rounded border flex items-center justify-center
          ${checked ? "bg-emerald-500 border-emerald-500" : "bg-white"}
          cursor-pointer hover:shadow-sm transition`}
      >
        {checked && (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 text-white"
            aria-hidden="true"
          >
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      <div className={`text-sm ${checked ? "line-through text-gray-500" : ""}`}>
        {name.charAt(0).toUpperCase() + name.slice(1)}
      </div>
    </div>
  );
}
