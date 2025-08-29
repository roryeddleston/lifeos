"use client";

import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";

const tabs = [
  { label: "All", value: "all" },
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "No date", value: "nodate" },
  { label: "Done", value: "done" },
];

export default function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "all";

  function setView(view: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.push(`?${params.toString()}`);
  }

  return (
    <div
      role="tablist"
      aria-label="Task filters"
      className="flex flex-wrap items-center gap-2"
    >
      {tabs.map((tab) => {
        const isActive = currentView === tab.value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => setView(tab.value)}
            className={clsx(
              "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--twc-accent)]",
              isActive ? "font-medium" : "opacity-85"
            )}
            style={{
              color: "var(--twc-text)",
              backgroundColor: isActive
                ? "color-mix(in oklab, var(--twc-text) 6%, var(--twc-surface))"
                : "transparent",
              border: "1px solid var(--twc-border)",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
