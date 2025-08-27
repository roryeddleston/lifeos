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
  const { title, action } = usePageHeader();

  return (
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
    <div className="min-h-screen md:flex">
      <Sidebar className="hidden md:block" />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <PageHeaderProvider>
        <MainColumn onOpenMenu={() => setMobileOpen(true)}>
          {children}
        </MainColumn>
      </PageHeaderProvider>
    </div>
  );
}
