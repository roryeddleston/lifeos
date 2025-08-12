"use client";
import { PageHeader } from "@/components/layout/page-header";
export default function TasksHeader() {
  return (
    <PageHeader
      title="Tasks"
      action={{ label: "New Task", href: "/tasks/new" }}
    />
  );
}
