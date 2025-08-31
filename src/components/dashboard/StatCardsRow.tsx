"use client";

import StatCard from "@/components/cards/StatCard";
import CountUp from "@/components/anim/CountUp";
import type { LucideIcon } from "lucide-react";
import { Activity, ListTodo, Target } from "lucide-react";

/** Data-only item sent from server */
export type StatItem = {
  label: string;
  value: number; // animate from 0 -> value
  total?: number; // if provided, show `${animated}/${total}`
  delta?: string;
  positive?: boolean;
  iconKey: "activity" | "tasks" | "target";
};

const ICONS: Record<StatItem["iconKey"], LucideIcon> = {
  activity: Activity,
  tasks: ListTodo,
  target: Target,
};

export default function StatCardsRow({ items }: { items: StatItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {items.map((it, i) => {
        const Icon = ICONS[it.iconKey];
        const duration = 900 + i * 100; // subtle stagger

        return (
          <StatCard
            key={`${it.label}-${i}`}
            label={it.label}
            value={
              typeof it.total === "number" ? (
                <CountUp to={it.value} duration={duration}>
                  {(v) => `${v}/${it.total}`}
                </CountUp>
              ) : (
                <CountUp to={it.value} duration={duration} />
              )
            }
            delta={it.delta ?? ""}
            positive={!!it.positive}
            icon={Icon}
          />
        );
      })}
    </div>
  );
}
