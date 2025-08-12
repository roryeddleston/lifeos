"use client";
import { PageHeader } from "@/components/layout/page-header";

export default function TasksPage() {
  return (
    <>
      <PageHeader
        title="Tasks"
        action={{ label: "New Task", href: "/tasks/new" }}
      />
      <div className="p-6">Tasks list coming soon…</div>
    </>
  );
}
