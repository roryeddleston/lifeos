"use client";

import type { PropsWithChildren } from "react";
import Sidebar from "@/components/layout/Sidebar";
// MobileSidebar removed from use to follow new mobile dropdown approach
import Topbar from "@/components/layout/Topbar";
import {
  PageHeaderProvider,
  usePageHeader,
} from "@/components/layout/page-header";
import TopbarMobile from "@/components/layout/TopbarMobile";

function MainColumn({ children }: PropsWithChildren) {
  const { title, action } = usePageHeader();

  return (
    <div className="flex-1 min-h-screen flex flex-col">
      {/* Desktop topbar unchanged */}
      <div className="hidden md:block">
        <Topbar
          // onOpenMenu no longer needed for mobile
          title={title}
          showSearch
          primaryActionHref={action?.href ?? "/tasks"}
          primaryActionLabel={action?.label ?? "New Task"}
        />
      </div>

      {/* Mobile compact topbar */}
      <div className="md:hidden">
        <TopbarMobile title={title ?? "Life OS"} />
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6 w-full">{children}</main>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:flex">
      <Sidebar className="hidden md:block" />
      <PageHeaderProvider>
        <MainColumn>{children}</MainColumn>
      </PageHeaderProvider>
    </div>
  );
}
