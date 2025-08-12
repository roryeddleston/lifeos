"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { containerVariants, cardVariants, fadeUp } from "@/lib/animations";
import Card from "@/components/cards/Card";
import StatCard from "@/components/cards/StatCard";
import { Activity, Flame, CheckCheck } from "lucide-react";

const HABITS = [
  { name: "Drink Water", streak: 5, completion: 86 },
  { name: "Read 10 mins", streak: 12, completion: 71 },
  { name: "Meditate", streak: 3, completion: 57 },
  { name: "Workout", streak: 7, completion: 64 },
];

export default function HabitsPage() {
  return (
    <>
      <PageHeader
        title="Habits"
        action={{ label: "New Habit", href: "/habits/new" }}
      />

      <div className="p-6">
        {/* Stats row */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={cardVariants}>
            <StatCard
              label="Active habits"
              value={HABITS.length}
              icon={Activity}
            />
          </motion.div>
          <motion.div variants={cardVariants}>
            <StatCard
              label="Best streak"
              value="12 days"
              delta="+2"
              positive
              icon={Flame}
            />
          </motion.div>
          <motion.div variants={cardVariants}>
            <StatCard
              label="Today completed"
              value="2/4"
              delta="+1"
              positive
              icon={CheckCheck}
            />
          </motion.div>
        </motion.div>

        {/* Habit cards */}
        <motion.h2
          className="text-lg font-semibold mt-8 mb-4"
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          Overview
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {HABITS.map((h) => (
            <motion.div key={h.name} variants={cardVariants}>
              <Card title={h.name} subtitle={`Streak: ${h.streak} days`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Completion</span>
                    <span>{h.completion}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full bg-gray-900"
                      style={{ width: `${h.completion}%` }}
                    />
                  </div>
                  <button className="w-full rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
                    Mark done today
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </>
  );
}
