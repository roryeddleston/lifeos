"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import MobileSidebar from "@/components/layout/MobileSidebar";
import Topbar from "@/components/layout/Topbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 md:flex">
      {/* Desktop sidebar */}
      <Sidebar className="hidden md:block" />

      {/* Mobile drawer sidebar */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main column */}
      <div className="flex-1 min-h-screen">
        <Topbar
          onOpenMenu={() => setMobileOpen(true)}
          title="Dashboard"
          showSearch
          primaryActionHref="/tasks"
          primaryActionLabel="New Task"
        />

        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </div>
    </div>
  );
}
