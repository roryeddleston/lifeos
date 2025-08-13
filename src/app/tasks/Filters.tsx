"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { k: "all", label: "All" },
  { k: "today", label: "Today" },
  { k: "week", label: "Week" },
  { k: "nodate", label: "No date" },
  { k: "done", label: "Completed" },
] as const;

export default function Filters() {
  const router = useRouter();
  const sp = useSearchParams();
  const view = (sp.get("view") ?? "all").toLowerCase();

  function setView(k: string) {
    const p = new URLSearchParams(sp);
    p.set("view", k);
    router.push(`/tasks?${p.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((o) => {
        const active = view === o.k;
        return (
          <button
            key={o.k}
            onClick={() => setView(o.k)}
            className={`rounded-full px-3 py-1 text-xs border transition
              ${
                active
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-300 hover:bg-gray-100"
              }`}
            aria-pressed={active}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
