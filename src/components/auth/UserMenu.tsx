// src/components/auth/UserMenu.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function UserMenu() {
  const { user, isLoading } = useUser();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (isLoading) {
    // Small skeleton/placeholder
    return (
      <div
        aria-busy="true"
        className="h-8 w-8 rounded-full"
        style={{
          background:
            "color-mix(in oklab, var(--twc-text) 10%, var(--twc-surface))",
        }}
      />
    );
  }

  // Not logged in: show a simple "Log in" pill
  if (!user) {
    const returnTo = encodeURIComponent(pathname || "/");
    return (
      <Link
        href={`/api/auth/login?returnTo=${returnTo}`}
        className="inline-flex items-center rounded-full px-3 py-1.5 text-sm focus:outline-none focus-visible:ring-2"
        style={{
          border: "1px solid var(--twc-border)",
          color: "var(--twc-text)",
          backgroundColor: "var(--twc-surface)",
        }}
      >
        Log in
      </Link>
    );
  }

  // Logged in: avatar + dropdown
  const displayName =
    (user.name && user.name.trim()) ||
    (user.email && user.email.split("@")[0]) ||
    "You";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full px-2 py-1 focus:outline-none focus-visible:ring-2"
        aria-haspopup="menu"
        aria-expanded={open}
        title={displayName}
        style={{
          border: "1px solid var(--twc-border)",
          backgroundColor: "var(--twc-surface)",
          color: "var(--twc-text)",
        }}
      >
        {user.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.picture}
            alt={displayName}
            className="h-7 w-7 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span
            className="h-7 w-7 inline-flex items-center justify-center rounded-full text-sm font-medium"
            aria-hidden
            style={{
              background:
                "color-mix(in oklab, var(--twc-text) 10%, var(--twc-surface))",
            }}
          >
            {initial}
          </span>
        )}
        <span className="hidden sm:inline text-sm">{displayName}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-xl border p-1 shadow-xl"
          role="menu"
          style={{
            borderColor: "var(--twc-border)",
            backgroundColor: "var(--twc-surface)",
            color: "var(--twc-text)",
          }}
        >
          <div className="px-3 py-2 text-sm">
            <div className="font-medium truncate">{displayName}</div>
            {user.email && (
              <div
                className="text-xs truncate"
                style={{ color: "var(--twc-muted)" }}
              >
                {user.email}
              </div>
            )}
          </div>
          <hr
            style={{
              border: 0,
              height: 1,
              background:
                "color-mix(in oklab, var(--twc-text) 10%, transparent)",
            }}
          />

          {/* Account (optional target) */}
          <Link
            href="/"
            className="block rounded-lg px-3 py-2 text-sm transition-colors"
            role="menuitem"
            onClick={() => setOpen(false)}
            style={{ color: "var(--twc-text)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "color-mix(in oklab, var(--twc-text) 8%, var(--twc-surface))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Home
          </Link>

          <Link
            href="/api/auth/logout"
            className="block rounded-lg px-3 py-2 text-sm transition-colors"
            role="menuitem"
            style={{ color: "var(--twc-text)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "color-mix(in oklab, var(--twc-text) 8%, var(--twc-surface))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Log out
          </Link>
        </div>
      )}
    </div>
  );
}
