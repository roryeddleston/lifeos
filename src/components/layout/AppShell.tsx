"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import MobileSidebar from "@/components/layout/MobileSidebar";
import Topbar from "@/components/layout/Topbar";
import {
  PageHeaderProvider,
  usePageHeader,
} from "@/components/layout/page-header";

function MainColumn({
  children,
  onOpenMenu,
}: {
  children: React.ReactNode;
  onOpenMenu: () => void;
}) {
  // Read title/action from context and pass to Topbar
  const { title, action } = usePageHeader();

  return (
    // Ensure Topbar and main stack vertically
    <div className="flex-1 min-h-screen flex flex-col">
      <Topbar
        onOpenMenu={onOpenMenu}
        title={title}
        showSearch
        primaryActionHref={action?.href ?? "/tasks"}
        primaryActionLabel={action?.label ?? "New Task"}
      />
      <main className="mx-auto max-w-6xl px-4 py-6 w-full">{children}</main>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 md:flex">
      {/* Left: desktop sidebar */}
      <Sidebar className="hidden md:block" />

      {/* Mobile drawer */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Right: column with Topbar + page content */}
      <PageHeaderProvider>
        <MainColumn onOpenMenu={() => setMobileOpen(true)}>
          {children}
        </MainColumn>
      </PageHeaderProvider>
    </div>
  );
}
