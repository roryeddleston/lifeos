"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  Variants,
} from "framer-motion";
import RowComplete from "./RowComplete";
import RowActions from "./RowActions";
import InlineTitle from "./InlineTitle";
import { formatDueLabel } from "@/lib/date";

type TaskItem = {
  id: string;
  title: string;
  dueDate: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
};

export default function TasksTable({
  initial,
  view,
}: {
  initial: TaskItem[];
  view: string;
}) {
  const [items, setItems] = useState<TaskItem[]>(initial);
  const prefersReduced = useReducedMotion();

  // Resync after server refresh
  useEffect(() => {
    setItems(initial);
  }, [initial]);

  // Capitalise first char for display
  const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  // Remove from visible list with animation
  function removeById(id: string) {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }

  // Subtle fade animation (no height collapse), respects reduced motion
  const rowVariants: Variants = prefersReduced
    ? { enter: { opacity: 1 }, exit: { opacity: 1 } }
    : { enter: { opacity: 1 }, exit: { opacity: 0 } };

  // Grouping only for "all"
  const grouped = useMemo(() => {
    if (view !== "all") return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const addDays = (n: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + n);
      return d;
    };
    const midnight = new Date(today);
    const tomorrow = addDays(1);
    const in7 = addDays(7);

    const buckets: { key: string; label: string; rows: TaskItem[] }[] = [
      { key: "overdue", label: "Overdue", rows: [] },
      { key: "today", label: "Today", rows: [] },
      { key: "tomorrow", label: "Tomorrow", rows: [] },
      { key: "week", label: "This Week", rows: [] },
      { key: "later", label: "Later", rows: [] },
      { key: "nodate", label: "No date", rows: [] },
    ];

    for (const t of items) {
      if (!t.dueDate) {
        buckets[5].rows.push(t);
        continue;
      }
      const due = new Date(t.dueDate);
      due.setHours(0, 0, 0, 0);

      if (due < midnight) buckets[0].rows.push(t);
      else if (due.getTime() === midnight.getTime()) buckets[1].rows.push(t);
      else if (due.getTime() === tomorrow.getTime()) buckets[2].rows.push(t);
      else if (due > tomorrow && due < in7) buckets[3].rows.push(t);
      else buckets[4].rows.push(t);
    }

    return buckets.filter((b) => b.rows.length > 0);
  }, [items, view]);

  const hasAny = view === "all" ? (grouped?.length ?? 0) > 0 : items.length > 0;

  const SectionRow = ({ label }: { label: string }) => (
    <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
      <td className="py-2 pr-2 w-10" />
      <td className="py-2 pr-4">{label}</td>
      <td className="py-2 pr-4" />
      <td className="py-2 pr-0 text-right" />
    </tr>
  );

  const todayMidnight = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  })();

  const Row = ({ t }: { t: TaskItem }) => {
    const isDone = t.status === "DONE";
    const isOverdue =
      !!t.dueDate &&
      new Date(t.dueDate).setHours(0, 0, 0, 0) < todayMidnight &&
      !isDone;

    return (
      <motion.tr
        key={t.id}
        layout="position"
        initial={false}
        variants={rowVariants}
        animate="enter"
        exit="exit"
        transition={{ duration: prefersReduced ? 0 : 0.12, ease: "easeOut" }}
        className="border-b border-gray-200 last:border-0 hover:bg-gray-50"
      >
        <td className="py-3 pr-2 align-middle">
          <RowComplete
            id={t.id}
            completed={isDone}
            onToggle={(next) => {
              // Remove in non-"done" when completing; remove in "done" when un-completing.
              if ((view !== "done" && next) || (view === "done" && !next)) {
                removeById(t.id);
              }
            }}
          />
        </td>

        <td className="py-3 pr-4 align-middle">
          {/* InlineTitle is a button now with clear hover/focus; we pass capitalised text for display */}
          <InlineTitle id={t.id} title={cap(t.title)} done={isDone} />
        </td>

        <td
          className={`py-3 pr-4 align-middle ${
            isOverdue ? "text-red-600" : ""
          }`}
        >
          {formatDueLabel(t.dueDate as any)}
        </td>

        <td className="py-3 pr-0 text-right align-middle">
          <RowActions id={t.id} title={t.title} dueDate={t.dueDate} />
        </td>
      </motion.tr>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-200">
            <th className="py-2 pr-2 w-10" />
            <th className="py-2 pr-4">Title</th>
            <th className="py-2 pr-4">Due</th>
            <th className="py-2 pr-0 text-right">Actions</th>
          </tr>
        </thead>

        {view !== "all" && (
          <tbody>
            {hasAny ? (
              <AnimatePresence initial={false}>
                {items.map((t) => (
                  <Row key={t.id} t={t} />
                ))}
              </AnimatePresence>
            ) : (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-500">
                  No tasks yet — add a few below.
                </td>
              </tr>
            )}
          </tbody>
        )}

        {view === "all" && (
          <tbody>
            {hasAny ? (
              grouped!.map((sec) => (
                <React.Fragment key={sec.key}>
                  <SectionRow label={sec.label} />
                  <AnimatePresence initial={false}>
                    {sec.rows.map((t) => (
                      <Row key={t.id} t={t} />
                    ))}
                  </AnimatePresence>
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-500">
                  No tasks yet — add a few below.
                </td>
              </tr>
            )}
          </tbody>
        )}
      </table>
    </div>
  );
}
