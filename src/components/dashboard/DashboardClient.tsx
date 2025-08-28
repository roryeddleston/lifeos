"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import StatCard from "@/components/cards/StatCard";
import Card from "@/components/cards/Card";
import { Activity, ListTodo, Target, BarChart3 } from "lucide-react";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_OUT, staggerChildren: 0.06 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_OUT } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
};

type Stats = {
  habitsToday: number;
  habitsDelta: number;
  tasksOpen: number;
  goalsOnTrack: string; // e.g. "2/4"
};

type ActivityItem = {
  kind: "habit" | "task";
  text: string;
  when: string; // already preformatted in server (e.g. "2h ago")
};

export default function DashboardClient({
  stats,
  activity,
}: {
  stats: Stats;
  activity: ActivityItem[];
}) {
  const deltaLabel =
    stats.habitsDelta === 0
      ? "0"
      : stats.habitsDelta > 0
      ? `+${stats.habitsDelta}`
      : `${stats.habitsDelta}`;
  const deltaPositive = stats.habitsDelta >= 0;

  return (
    <div className="p-6">
      {/* Title */}
      <motion.h1
        className="text-4xl font-bold tracking-tight mb-6"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        Dashboard
      </motion.h1>

      {/* Stats row */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={cardVariants}>
          <StatCard
            label="Habits completed (today)"
            value={stats.habitsToday}
            delta={deltaLabel}
            positive={deltaPositive}
            icon={Activity}
          />
        </motion.div>

        <motion.div variants={cardVariants}>
          <StatCard
            label="Open tasks"
            value={stats.tasksOpen}
            delta=""
            positive
            icon={ListTodo}
          />
        </motion.div>

        <motion.div variants={cardVariants}>
          <StatCard
            label="Goals on track"
            value={stats.goalsOnTrack}
            delta=""
            positive
            icon={Target}
          />
        </motion.div>
      </motion.div>

      {/* Charts / sections */}
      <motion.div
        className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={cardVariants}>
          <Card title="Weekly Habit Streaks" subtitle="Last 7 days">
            <div
              className="h-48 rounded-md flex items-center justify-center"
              style={{
                border: "1px solid var(--twc-border)",
                background:
                  "color-mix(in oklab, var(--twc-text) 6%, var(--twc-surface))",
                color: "color-mix(in oklab, var(--twc-text) 60%, transparent)",
              }}
            >
              <BarChart3 size={18} className="mr-2" /> Placeholder chart
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card title="Recent Activity" subtitle="Most recent updates">
            {activity.length === 0 ? (
              <div className="text-sm" style={{ color: "var(--twc-muted)" }}>
                No recent activity
              </div>
            ) : (
              <ul className="space-y-2 text-sm">
                {activity.map((a, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span style={{ color: "var(--twc-text)" }}>{a.text}</span>
                    <span
                      style={{
                        color:
                          "color-mix(in oklab, var(--twc-text) 55%, transparent)",
                      }}
                    >
                      {a.when}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
