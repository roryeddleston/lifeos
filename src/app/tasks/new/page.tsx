"use client";

import { PageHeader } from "@/components/layout/page-header";
import TaskForm from "@/components/forms/TaskForm"; // <-- default import
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";

export default function NewTaskPage() {
  return (
    <>
      <PageHeader title="New Task" action={null} />
      <div className="p-6">
        <motion.h2
          className="text-lg font-semibold mb-4"
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          Create a task
        </motion.h2>
        <TaskForm />
      </div>
    </>
  );
}
