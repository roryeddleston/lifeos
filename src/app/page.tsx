"use client";

import { motion } from "framer-motion";
import { containerVariants, cardVariants, fadeUp } from "@/lib/animations";

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

      {/* Top row */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {["Chart / Stats", "Habits Overview", "Tasks Overview"].map((label) => (
          <motion.div
            key={label}
            variants={cardVariants}
            className="h-32 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center
                       shadow-sm hover:shadow transition-shadow"
          >
            {label}
          </motion.div>
        ))}
      </motion.div>

      {/* Second row */}
      <motion.div
        className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {["Goals Progress", "Recent Activity"].map((label) => (
          <motion.div
            key={label}
            variants={cardVariants}
            className="h-48 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center
                       shadow-sm hover:shadow transition-shadow"
          >
            {label}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
