"use client";

import { useState } from "react";
import Card from "@/components/cards/Card";
import GoalCard from "@/components/goals/GoalCard";

type Goal = {
  id: string;
  title: string;
  description?: string | null;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string | null; // ISO
  createdAt: string; // ISO
};

export default function GoalsTabs({
  active,
  completed,
}: {
  active: Goal[];
  completed: Goal[];
}) {
  const [tab, setTab] = useState<"active" | "completed">("active");

  const TabButton = ({
    value,
    label,
    count,
  }: {
    value: "active" | "completed";
    label: string;
    count: number;
  }) => {
    const isActive = tab === value;
    return (
      <button
        type="button"
        onClick={() => setTab(value)}
        className={[
          "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors cursor-pointer",
          isActive ? "font-medium shadow-sm" : "opacity-90",
        ].join(" ")}
        style={{
          color: "var(--twc-text)",
          backgroundColor: isActive
            ? "color-mix(in oklab, var(--twc-text) 8%, var(--twc-surface))"
            : "transparent",
          border: `1px solid var(--twc-border)`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isActive
            ? "color-mix(in oklab, var(--twc-text) 12%, var(--twc-surface))"
            : "color-mix(in oklab, var(--twc-text) 6%, var(--twc-surface))";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isActive
            ? "color-mix(in oklab, var(--twc-text) 8%, var(--twc-surface))"
            : "transparent";
        }}
        aria-pressed={isActive}
      >
        {label}
        <span
          className="rounded-full px-1.5 text-[11px] tabular-nums"
          style={{
            backgroundColor:
              "color-mix(in oklab, var(--twc-text) 10%, transparent)",
          }}
        >
          {count}
        </span>
      </button>
    );
  };

  const list = tab === "active" ? active : completed;

  return (
    <Card className="border-0 !shadow-none">
      {/* Tabs header */}
      <div className="px-4 pt-2 pb-3 flex items-center gap-2">
        <TabButton value="active" label="Active" count={active.length} />
        <TabButton
          value="completed"
          label="Completed"
          count={completed.length}
        />
      </div>

      {/* List */}
      {list.length === 0 ? (
        <div className="px-4 py-14">
          <div
            className="mx-auto max-w-md rounded-lg px-6 py-8 text-center"
            style={{
              backgroundColor: "var(--twc-surface)",
              border: `1px solid var(--twc-border)`,
              color: "var(--twc-text)",
            }}
          >
            <h3
              className="text-sm font-medium"
              style={{ color: "var(--twc-text)" }}
            >
              {tab === "active" ? "No active goals" : "No completed goals"}
            </h3>
            <p className="mt-2 text-sm" style={{ color: "var(--twc-muted)" }}>
              {tab === "active"
                ? "Add a goal below to get started."
                : "Finish a goal and it will show up here."}
            </p>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--twc-border)]">
          {list.map((g) => (
            <li key={g.id} className="px-4 py-3">
              <GoalCard goal={g} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
