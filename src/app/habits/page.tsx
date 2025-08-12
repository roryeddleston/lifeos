"use client";
import { PageHeader } from "@/components/layout/page-header";

export default function HabitsPage() {
  return (
    <>
      <PageHeader
        title="Habits"
        action={{ label: "New Habit", href: "/habits/new" }}
      />
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Habits Overview</h2>
        <div className="h-32 bg-gray-100 rounded-lg" />
      </div>
    </>
  );
}
