"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import RowComplete from "./RowComplete";
import RowActions from "./RowActions";
import InlineTitle from "./InlineTitle";
import InlineDueDate from "./InlineDueDate";
import { GripVertical, CheckCircle2, ClipboardList } from "lucide-react";

type TaskItem = {
  id: string;
  title: string;
  dueDate: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  position?: number;
};

export default function TasksTable({
  initial,
  view,
}: {
  initial: TaskItem[];
  view: string;
}) {
  const [items, setItems] = useState<TaskItem[]>(initial);
  const [overId, setOverId] = useState<string | null>(null);

  // Keep client list in sync with server results on navigation/filter changes
  useEffect(() => setItems(initial), [initial]);

  const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  // Optimistically adjust list when completing/un-completing (server already filters DONE per view)
  const handleToggleComplete = (id: string, next: boolean) => {
    setItems((curr) => {
      const updated = curr.map((t) =>
        t.id === id ? { ...t, status: next ? "DONE" : "TODO" } : t
      );
      if (next && view !== "done") return updated.filter((t) => t.id !== id);
      if (!next && view === "done") return updated.filter((t) => t.id !== id);
      return updated;
    });
  };

  // Grouping for "all" (server already excludes DONE here)
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

  // Section header row rendered as array cells (avoid whitespace nodes in <tr>)
  const SectionHeaderRow = ({ label }: { label: string }) => (
    <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
      {[
        <td key="drag" className="py-2 pr-2 w-6" />,
        <td key="chk" className="py-2 pr-2 w-10" />,
        <td key="label" className="py-2 pr-4">
          {label}
        </td>,
        <td key="due" className="py-2 pr-4" />,
        <td key="actions" className="py-2 pr-0 text-right" />,
      ]}
    </tr>
  );

  // DND
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function onDragOver(e: DragOverEvent) {
    setOverId(e.over?.id?.toString() ?? null);
  }
  function onDragCancel() {
    setOverId(null);
  }
  function onDragEnd(e: DragEndEvent) {
    setOverId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    setItems((curr) => {
      const oldIndex = curr.findIndex((x) => x.id === active.id);
      const newIndex = curr.findIndex((x) => x.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return curr.slice();

      const clone = curr.slice();
      const [moved] = clone.splice(oldIndex, 1);
      clone.splice(newIndex, 0, moved);

      const payload = clone.map((t, i) => ({ id: t.id, position: i + 1 }));
      fetch("/api/tasks/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload }),
      }).catch(() => {});

      return clone.map((t, i) => ({ ...t, position: i + 1 }));
    });
  }

  function SortableRow({ t }: { t: TaskItem }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: t.id,
      animateLayoutChanges: () => false, // prevent flicker
    });

    const baseTransform = CSS.Transform.toString(transform);
    const style: React.CSSProperties = {
      transform: isDragging
        ? `${baseTransform} scale(0.998)`
        : baseTransform || undefined,
      transition: transition || "transform 150ms ease",
      boxShadow: isDragging ? "0 1px 4px rgba(0,0,0,0.08)" : undefined,
    };

    const isDone = t.status === "DONE";
    const isOverdue =
      !!t.dueDate &&
      new Date(t.dueDate).setHours(0, 0, 0, 0) <
        new Date(new Date().setHours(0, 0, 0, 0)).getTime() &&
      !isDone;

    const isDropTarget = overId === t.id;

    return (
      <tr
        ref={setNodeRef as any}
        style={style}
        key={t.id}
        className={`group border-b border-gray-200 last:border-0 hover:bg-gray-50 ${
          isDropTarget ? "ring-2 ring-gray-200" : ""
        }`}
      >
        {[
          // Drag handle
          <td key="drag" className="py-3 pr-2 align-middle w-6">
            <button
              type="button"
              className="p-1 rounded hover:bg-gray-100 cursor-grab active:cursor-grabbing"
              title="Drag to reorder"
              aria-label="Drag to reorder"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="w-4 h-4 text-gray-500" />
            </button>
          </td>,

          // Complete checkbox
          <td key="chk" className="py-3 pr-2 align-middle w-10">
            <RowComplete
              id={t.id}
              completed={isDone}
              onToggle={(next) => handleToggleComplete(t.id, next)}
            />
          </td>,

          // Title
          <td key="title" className="py-3 pr-4 align-middle">
            <InlineTitle id={t.id} title={cap(t.title)} done={isDone} />
          </td>,

          // Due
          <td
            key="due"
            className={`py-3 pr-4 align-middle ${
              isOverdue ? "text-red-600" : ""
            }`}
          >
            <InlineDueDate id={t.id} due={t.dueDate} done={isDone} />
          </td>,

          // Actions
          <td key="actions" className="py-3 pr-0 text-right align-middle">
            <RowActions id={t.id} title={t.title} dueDate={t.dueDate} />
          </td>,
        ]}
      </tr>
    );
  }

  const renderRows = (rows: TaskItem[]) => (
    <SortableContext
      items={rows.map((r) => r.id)}
      strategy={verticalListSortingStrategy}
    >
      {rows.map((t) => (
        <SortableRow key={t.id} t={t} />
      ))}
    </SortableContext>
  );

  // Header as array cells (avoid whitespace nodes)
  const Header = () => (
    <thead>
      <tr className="text-left text-gray-500 border-b border-gray-200">
        {[
          <th key="drag" className="py-2 pr-2 w-6" />,
          <th key="chk" className="py-2 pr-2 w-10" />,
          <th key="title" className="py-2 pr-4">
            Title
          </th>,
          <th key="due" className="py-2 pr-4">
            Due
          </th>,
          <th key="actions" className="py-2 pr-0 text-right">
            Actions
          </th>,
        ]}
      </tr>
    </thead>
  );

  // --------- EMPTY STATE OUTSIDE THE TABLE (fills full width) ----------
  const EmptyBlock = () => {
    const isDoneView = view === "done";
    return (
      <div className="py-16 flex w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          {isDoneView ? (
            <CheckCircle2 className="h-8 w-8 text-emerald-500" aria-hidden />
          ) : (
            <ClipboardList className="h-8 w-8 text-gray-400" aria-hidden />
          )}
          <div className="text-gray-700 font-medium">
            {isDoneView ? "No completed tasks yet" : "No tasks yet"}
          </div>
          <div className="text-gray-500 text-sm">
            {isDoneView ? (
              "Finish a task and it will show up here."
            ) : (
              <>
                Add your first task below — try typing <em>“tomorrow”</em> or{" "}
                <em>“mon”</em> to set a due date quickly.
              </>
            )}
          </div>
          {!isDoneView && (
            <button
              type="button"
              onClick={() => document.getElementById("quickadd")?.focus()}
              className="mt-2 inline-flex items-center rounded-md bg-gray-900 text-white px-3 py-1.5 text-sm hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 cursor-pointer"
              aria-label="Focus quick add input"
            >
              Add a task
            </button>
          )}
        </div>
      </div>
    );
  };
  // --------------------------------------------------------------------

  return (
    <div className="overflow-x-auto">
      {hasAny ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragOver={onDragOver}
          onDragCancel={onDragCancel}
          onDragEnd={onDragEnd}
        >
          <table className="w-full text-sm">
            <Header />

            {view !== "all" && (
              <tbody>{items.length ? renderRows(items) : null}</tbody>
            )}

            {view === "all" &&
              grouped!.map((sec) => (
                <tbody key={sec.key}>
                  <SectionHeaderRow label={sec.label} />
                  {renderRows(sec.rows)}
                </tbody>
              ))}
          </table>
        </DndContext>
      ) : (
        <EmptyBlock />
      )}
    </div>
  );
}
