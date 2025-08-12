"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import MobileSidebar from "@/components/layout/MobileSidebar";
import { Menu } from "lucide-react";
import { MotionConfig } from "framer-motion";
import { t } from "@/lib/motion";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    // Global motion defaults
    <MotionConfig
      transition={t.base}
      reducedMotion="user" // honors prefers-reduced-motion
    >
      <div className="min-h-screen bg-white text-gray-900 md:flex">
        {/* Desktop sidebar */}
        <Sidebar className="hidden md:block" />

        {/* Mobile drawer sidebar */}
        <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

        {/* Main column */}
        <div className="flex-1 min-h-screen">
          {/* Topbar */}
          <header className="sticky top-0 z-20 border-b bg-white/70 backdrop-blur">
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
              <button
                className="md:hidden rounded p-2 hover:bg-gray-100"
                aria-label="Open menu"
                onClick={() => setMobileOpen(true)}
              >
                <Menu size={20} />
              </button>
              <h1 className="text-sm font-medium tracking-tight">
                Welcome back
              </h1>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </div>
      </div>
    </MotionConfig>
  );
}
