"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { Menu, Plus } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { usePathname } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function TopbarMobile({ title }: { title: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const pathname = usePathname();

  // --- auth (for login/avatar) ---
  const { user, isLoading } = useUser();
  const [userOpen, setUserOpen] = useState(false);
  const userWrapRef = useRef<HTMLDivElement | null>(null);

  // Close panels when route changes
  useEffect(() => {
    if (menuOpen) setMenuOpen(false);
    if (quickOpen) setQuickOpen(false);
    if (userOpen) setUserOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close panels if resizing up to desktop
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setMenuOpen(false);
        setQuickOpen(false);
        setUserOpen(false);
      }
    };
    if (mql.matches) {
      setMenuOpen(false);
      setQuickOpen(false);
      setUserOpen(false);
    }
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }
    // Legacy fallback
    (mql as any).addListener?.(onChange);
    return () => (mql as any).removeListener?.(onChange);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    if (!userOpen) return;
    const onDown = (e: PointerEvent) => {
      const el = userWrapRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setUserOpen(false);
      }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [userOpen]);

  // Helpers
  const toggleMenu = () => {
    setMenuOpen((v) => !v);
    setQuickOpen(false);
    setUserOpen(false);
  };
  const toggleQuick = () => {
    setQuickOpen((v) => !v);
    setMenuOpen(false);
    setUserOpen(false);
  };
  const closeAll = () => {
    setMenuOpen(false);
    setQuickOpen(false);
    setUserOpen(false);
  };

  // Reusable styles
  const buttonClass =
    "inline-flex h-10 w-10 items-center justify-center rounded-lg border";
  const panelBase = "absolute left-0 right-0 top-full z-50 border-b shadow-sm";

  const returnTo = encodeURIComponent(pathname || "/");

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

        {/* Right: Theme + Quick actions + Auth */}
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

          {/* Auth control */}
          <div className="relative" ref={userWrapRef}>
            {isLoading ? (
              <div
                aria-busy="true"
                className="h-10 w-10 rounded-lg border"
                style={{
                  borderColor: "var(--twc-border)",
                  background:
                    "color-mix(in oklab, var(--twc-text) 8%, var(--twc-surface))",
                }}
              />
            ) : user ? (
              <>
                <button
                  type="button"
                  aria-label="Account"
                  onClick={() => setUserOpen((v) => !v)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border cursor-pointer focus:outline-none focus-visible:ring-2"
                  style={{
                    borderColor: "var(--twc-border)",
                    backgroundColor: "var(--twc-surface)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.picture || ""}
                    alt={user.name || "You"}
                    className="h-8 w-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>

                {userOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-xl border p-1 shadow-xl"
                    role="menu"
                    style={{
                      borderColor: "var(--twc-border)",
                      backgroundColor: "var(--twc-surface)",
                      color: "var(--twc-text)",
                    }}
                  >
                    <Link
                      href="/"
                      className="block rounded-lg px-3 py-2 text-sm"
                      style={{ color: "var(--twc-text)" }}
                      role="menuitem"
                      onClick={closeAll}
                    >
                      Home
                    </Link>
                    <Link
                      href="/api/auth/logout"
                      className="block rounded-lg px-3 py-2 text-sm"
                      style={{ color: "var(--twc-text)" }}
                      role="menuitem"
                      onClick={closeAll}
                    >
                      Log out
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <Link
                href={`/api/auth/login?returnTo=${returnTo}`}
                aria-label="Log in"
                className={`${buttonClass} text-sm`}
                style={{
                  borderColor: "var(--twc-border)",
                  color: "var(--twc-text)",
                  backgroundColor: "var(--twc-surface)",
                }}
              >
                Log in
              </Link>
            )}
          </div>
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
                    className="block w-full px-4 py-4 text-md"
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
