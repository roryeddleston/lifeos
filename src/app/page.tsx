"use client";

import { motion } from "framer-motion";
import { containerVariants, cardVariants, fadeUp } from "@/lib/animations";
import StatCard from "@/components/cards/StatCard";
import Card from "@/components/cards/Card";
import { Activity, ListTodo, Target, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="p-6">
      {/* Title */}
      <motion.h1
        className="text-2xl font-bold mb-6"
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
            value={3}
            delta="+1"
            positive
            icon={Activity}
          />
        </motion.div>

        <motion.div variants={cardVariants}>
          <StatCard
            label="Open tasks"
            value={12}
            delta="-3"
            positive={false}
            icon={ListTodo}
          />
        </motion.div>

        <motion.div variants={cardVariants}>
          <StatCard
            label="Goals on track"
            value="2/4"
            delta="+1"
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
            <div className="h-48 rounded-md bg-gray-100 flex items-center justify-center text-gray-500">
              <BarChart3 className="mr-2" size={18} /> Placeholder chart
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card title="Recent Activity" subtitle="Most recent updates">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between">
                <span>Completed “Drink Water”</span>
                <span className="text-gray-500">2m ago</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Marked “Write Journal” as skipped</span>
                <span className="text-gray-500">1h ago</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Created goal “Read 10 books”</span>
                <span className="text-gray-500">Yesterday</span>
              </li>
            </ul>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
