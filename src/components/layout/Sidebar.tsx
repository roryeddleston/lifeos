"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutGrid,
  ListTodo,
  Target,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutGrid },
  { label: "Habits", href: "/habits", icon: Activity },
  { label: "Tasks", href: "/tasks", icon: ListTodo },
  { label: "Goals", href: "/goals", icon: Target },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  return (
    <aside
      className={`h-screen sticky top-0 border-r bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60
      ${
        open ? "w-64" : "w-16"
      } transition-[width] duration-300 ease-out hidden md:block`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          {open ? "Life OS" : "LO"}
        </Link>
        <button
          aria-label="Toggle sidebar"
          onClick={() => setOpen((v) => !v)}
          className="rounded p-1 text-gray-500 hover:bg-gray-100"
        >
          {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="px-2">
        <ul className="space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition
                    ${
                      active
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <Icon
                    size={18}
                    className={`${
                      active ? "opacity-100" : "opacity-80"
                    } shrink-0`}
                    aria-hidden
                  />
                  <span
                    className={`${
                      open ? "opacity-100" : "opacity-0 md:opacity-0"
                    } transition-opacity duration-200`}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
