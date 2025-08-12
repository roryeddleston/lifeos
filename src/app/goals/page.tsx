"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { containerVariants, cardVariants, fadeUp } from "@/lib/animations";
import Card from "@/components/cards/Card";
import StatCard from "@/components/cards/StatCard";
import { Target, TrendingUp, ClipboardList } from "lucide-react";

const GOALS = [
  { title: "Read 10 books", current: 4, target: 10, unit: "books" },
  { title: "Run 100 km", current: 62, target: 100, unit: "km" },
  { title: "Ship MVP", current: 70, target: 100, unit: "%" },
];

export default function GoalsPage() {
  const avgProgress = Math.round(
    GOALS.reduce(
      (sum, g) => sum + Math.min(100, Math.round((g.current / g.target) * 100)),
      0
    ) / GOALS.length
  );

  return (
    <>
      <PageHeader
        title="Goals"
        action={{ label: "New Goal", href: "/goals/new" }}
      />

      <div className="p-6">
        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={cardVariants}>
            <StatCard
              label="Total goals"
              value={GOALS.length}
              icon={ClipboardList}
            />
          </motion.div>
          <motion.div variants={cardVariants}>
            <StatCard
              label="On track"
              value="2"
              delta="+1"
              positive
              icon={TrendingUp}
            />
          </motion.div>
          <motion.div variants={cardVariants}>
            <StatCard
              label="Average progress"
              value={`${avgProgress}%`}
              icon={Target}
            />
          </motion.div>
        </motion.div>

        {/* Goals list */}
        <motion.h2
          className="text-lg font-semibold mt-8 mb-4"
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          Your goals
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {GOALS.map((g) => {
            const pct = Math.min(100, Math.round((g.current / g.target) * 100));
            return (
              <motion.div key={g.title} variants={cardVariants}>
                <Card
                  title={g.title}
                  subtitle={`${g.current} / ${g.target} ${g.unit}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Progress</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full bg-gray-900"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
                        Update
                      </button>
                      <button className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
                        View
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </>
  );
}
