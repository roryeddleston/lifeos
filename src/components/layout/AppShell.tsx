"use client";

import type { PropsWithChildren } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import {
  PageHeaderProvider,
  usePageHeader,
} from "@/components/layout/page-header";
import TopbarMobile from "@/components/layout/TopbarMobile";

function MainColumn({ children }: PropsWithChildren) {
  const { title, action } = usePageHeader();

  return (
    <div className="flex-1 min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      {/* Desktop topbar */}
      <div className="hidden md:block">
        <Topbar
          title={title}
          showSearch
          primaryActionHref={action?.href ?? "/tasks"}
          primaryActionLabel={action?.label ?? "New Task"}
        />
      </div>

      {/* Mobile topbar */}
      <div className="md:hidden">
        <TopbarMobile title={title ?? "Life OS"} />
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6 w-full">{children}</main>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:flex bg-[var(--bg)] text-[var(--text)]">
      {/* Sidebar for desktop only */}
      <Sidebar className="hidden md:block" />

      {/* Provide dynamic page header context */}
      <PageHeaderProvider>
        <MainColumn>{children}</MainColumn>
      </PageHeaderProvider>
    </div>
  );
}
