"use client";
import { PageHeader } from "@/components/layout/page-header";

export default function GoalsPage() {
  return (
    <>
      <PageHeader
        title="Goals"
        action={{ label: "New Goal", href: "/goals/new" }}
      />
      <div className="p-6">Goals progress coming soon…</div>
    </>
  );
}
