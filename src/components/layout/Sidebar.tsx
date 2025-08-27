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

export default function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  const W_OPEN = 256; // w-64
  const W_COLLAPSED = 64; // w-16

  return (
    <aside
      className={[
        "h-screen sticky top-0 overflow-hidden",
        "transition-[width] duration-300 ease-out will-change-[width]",
        className,
      ].join(" ")}
      style={{
        width: open ? W_OPEN : W_COLLAPSED,
        // Soft divider instead of heavy border
        boxShadow: `inset -1px 0 0 var(--twc-border)`,
        // Glass surface that respects theme
        backgroundColor: "color-mix(in oklab, var(--twc-bg) 86%, transparent)",
        backdropFilter: "blur(10px)",
      }}
      aria-expanded={open}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-4"
        style={{ color: "var(--twc-text)" }}
      >
        <Link
          href="/"
          className="font-semibold tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 dark:focus-visible:ring-emerald-400/60 rounded"
          title="Life OS"
        >
          {open ? "Life OS" : "LO"}
        </Link>

        <button
          aria-label="Toggle sidebar"
          onClick={() => setOpen((v) => !v)}
          className="rounded p-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 dark:focus-visible:ring-emerald-400/60"
          style={{ color: "var(--twc-muted)" }}
        >
          {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="px-2">
        <ul className="space-y-1.5">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;

            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  title={!open ? label : undefined}
                  className={[
                    "group relative flex items-center rounded-lg px-3 py-2.5 text-sm",
                    "transition-colors ease-out",
                    open ? "gap-3 justify-start" : "gap-0 justify-center",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 dark:focus-visible:ring-emerald-400/60",
                  ].join(" ")}
                  // Calm hover + subtle active tint that adapts to theme
                  style={{
                    color: "var(--twc-text)",
                    backgroundColor: active
                      ? "color-mix(in oklab, var(--twc-text) 5%, var(--twc-bg))"
                      : "transparent",
                  }}
                >
                  {/* Accent rail for active */}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r"
                      style={{
                        width: 2,
                        height: 20,
                        backgroundColor: "var(--twc-accent)",
                      }}
                    />
                  )}

                  <span
                    className={[
                      "grid place-items-center rounded-md transition",
                      active
                        ? "opacity-100"
                        : "opacity-80 group-hover:opacity-100",
                    ].join(" ")}
                    style={{
                      width: 24,
                      height: 24,
                      color: "var(--twc-text)",
                    }}
                  >
                    <Icon size={18} aria-hidden />
                  </span>

                  {/* Label (animates cleanly when collapsing) */}
                  <span
                    className={[
                      "whitespace-nowrap overflow-hidden transition-all duration-200",
                      open
                        ? "ml-2 opacity-100 max-w-[12rem]"
                        : "ml-0 opacity-0 max-w-0",
                    ].join(" ")}
                    style={{ color: "var(--twc-text)" }}
                  >
                    {label}
                  </span>

                  {/* Hover tint (very subtle, under content) */}
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background:
                        "color-mix(in oklab, var(--twc-text) 3%, transparent)",
                    }}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer (optional): compact brand or version, keeps visual balance */}
      <div
        className="absolute bottom-0 left-0 right-0 px-3 py-3 text-[11px]"
        style={{
          color: "var(--twc-muted)",
          boxShadow: `inset 0 1px 0 var(--twc-border)`,
          background: "color-mix(in oklab, var(--twc-bg) 92%, transparent)",
        }}
      >
        <div
          className={[
            "flex items-center",
            open ? "justify-between" : "justify-center",
          ].join(" ")}
        >
          {open ? <span>v1.0</span> : <span>•</span>}
        </div>
      </div>
    </aside>
  );
}
