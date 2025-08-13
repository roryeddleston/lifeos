"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Menu, Search, Plus, CalendarDays } from "lucide-react";

export default function Topbar({
  onOpenMenu,
  title = "Welcome back",
  showSearch = true,
  primaryActionHref = "/tasks",
  primaryActionLabel = "New Task",
}: {
  onOpenMenu: () => void;
  title?: string;
  showSearch?: boolean;
  primaryActionHref?: string;
  primaryActionLabel?: string;
}) {
  // 👇 Render date only after mount to avoid hydration mismatch
  const [today, setToday] = useState<string>("");

  useEffect(() => {
    // Pick a fixed locale & timezone for consistency across users
    const formatted = new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "Europe/London",
    }).format(new Date());
    setToday(formatted);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
        <button
          className="md:hidden rounded p-2 hover:bg-gray-100"
          aria-label="Open menu"
          onClick={onOpenMenu}
        >
          <Menu size={20} />
        </button>

        <h1 className="text-sm font-medium tracking-tight">{title}</h1>

        <div className="flex-1" />

        {/* Date (client-only to prevent hydration mismatch) */}
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
          <CalendarDays size={16} />
          <span aria-label="Today">{today || ""}</span>
        </div>

        {showSearch && (
          <form
            role="search"
            className="hidden md:flex items-center gap-2 rounded-md border px-2 py-1.5 bg-white"
            onSubmit={(e) => e.preventDefault()}
          >
            <Search size={16} className="text-gray-500" />
            <input
              type="search"
              placeholder="Search…"
              aria-label="Search"
              className="w-48 outline-none placeholder:text-gray-400 text-sm"
            />
          </form>
        )}

        <Link
          href={primaryActionHref}
          className="inline-flex items-center gap-2 rounded-md bg-gray-900 text-white text-sm px-3 py-2 hover:bg-black transition-colors"
        >
          <Plus size={16} />
          <span>{primaryActionLabel}</span>
        </Link>
      </div>
    </header>
  );
}
