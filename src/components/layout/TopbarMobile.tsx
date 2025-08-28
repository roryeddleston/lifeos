"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Plus } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { usePathname } from "next/navigation";

export default function TopbarMobile({ title }: { title: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const pathname = usePathname();

  // Close panels when route changes
  useEffect(() => {
    if (menuOpen) setMenuOpen(false);
    if (quickOpen) setQuickOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close panels if resizing up to desktop
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setMenuOpen(false);
        setQuickOpen(false);
      }
    };
    if (mql.matches) {
      setMenuOpen(false);
      setQuickOpen(false);
    }
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }
    // Legacy fallback
    (mql as any).addListener?.(onChange);
    return () => (mql as any).removeListener?.(onChange);
  }, []);

  // Helpers
  const toggleMenu = () => {
    setMenuOpen((v) => !v);
    setQuickOpen(false);
  };
  const toggleQuick = () => {
    setQuickOpen((v) => !v);
    setMenuOpen(false);
  };
  const closeAll = () => {
    setMenuOpen(false);
    setQuickOpen(false);
  };

  // Reusable styles
  const buttonClass =
    "inline-flex h-10 w-10 items-center justify-center rounded-lg border";
  const panelBase = "absolute left-0 right-0 top-full z-50 border-b shadow-sm";

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        backgroundColor: "var(--twc-surface)",
        borderColor: "var(--twc-border)",
      }}
    >
      {/* Topbar: taller (h-14 = 56px), centered content */}
      <div className="relative h-14 px-3 flex items-center justify-between gap-2">
        {/* Left: Hamburger */}
        <div className="flex items-center">
          <button
            aria-label="Open menu"
            className={buttonClass}
            style={{
              borderColor: "var(--twc-border)",
              color: "var(--twc-text)",
              backgroundColor: "var(--twc-surface)",
            }}
            onClick={toggleMenu}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-panel"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Center: Title */}
        <div className="min-w-0 flex-1 flex items-center justify-center">
          <span
            className="truncate text-sm font-medium tracking-tight"
            style={{ color: "var(--twc-text)" }}
          >
            {title || "Life OS"}
          </span>
        </div>

        {/* Right: Theme + Quick actions (search hidden per your note) */}
        <div className="flex items-center gap-1.5">
          <div className="inline-flex h-10 w-10 items-center justify-center">
            <ThemeToggle />
          </div>

          <button
            aria-label="Quick actions"
            className={buttonClass}
            style={{
              borderColor: "var(--twc-border)",
              color: "var(--twc-text)",
              backgroundColor: "var(--twc-surface)",
            }}
            onClick={toggleQuick}
            aria-expanded={quickOpen}
            aria-controls="mobile-quick-panel"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Full-width NAV panel (big tap targets) */}
        {menuOpen && (
          <nav
            id="mobile-nav-panel"
            className={`${panelBase}`}
            style={{
              backgroundColor: "var(--twc-surface)",
              borderColor: "var(--twc-border)",
            }}
          >
            <ul className="py-1">
              {[
                { href: "/", label: "Dashboard" },
                { href: "/tasks", label: "Tasks" },
                { href: "/habits", label: "Habits" },
                { href: "/goals", label: "Goals" },
              ].map((item) => (
                <li
                  key={item.href}
                  className="border-t first:border-t-0"
                  style={{ borderColor: "var(--twc-border)" }}
                >
                  <Link
                    href={item.href}
                    className="block w-full px-4 py-3 text-base"
                    style={{
                      color:
                        "color-mix(in oklab, var(--twc-text) 90%, transparent)",
                    }}
                    onClick={closeAll}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Quick actions panel (not a duplicate of nav) */}
        {quickOpen && (
          <div
            id="mobile-quick-panel"
            className={`${panelBase}`}
            style={{
              backgroundColor: "var(--twc-surface)",
              borderColor: "var(--twc-border)",
            }}
          >
            <ul className="py-1">
              {[
                { href: "/tasks?quick=1", label: "New Task" },
                { href: "/habits?new=1", label: "New Habit" },
                { href: "/goals?new=1", label: "New Goal" },
              ].map((item) => (
                <li
                  key={item.href}
                  className="border-t first:border-t-0"
                  style={{ borderColor: "var(--twc-border)" }}
                >
                  <Link
                    href={item.href}
                    className="block w-full px-4 py-4 text-lg"
                    style={{
                      color:
                        "color-mix(in oklab, var(--twc-text) 90%, transparent)",
                    }}
                    onClick={closeAll}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
