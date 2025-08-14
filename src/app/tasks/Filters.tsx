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
    <div className="flex gap-1">
      {tabs.map((tab) => {
        const isActive = currentView === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => setView(tab.value)}
            className={clsx(
              "px-3 py-1.5 rounded-md text-sm transition-colors",
              "cursor-pointer hover:bg-gray-100 hover:text-gray-900",
              isActive
                ? "bg-gray-900 text-white hover:bg-black"
                : "text-gray-600"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
