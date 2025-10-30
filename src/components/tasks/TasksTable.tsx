"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragOverEvent } from "@dnd-kit/core";
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
import { useToast } from "@/components/ui/Toaster";
import { deleteTask, reorderTasks, updateTask } from "@/app/tasks/actions";

type TaskItem = {
  id: string;
  title: string;
  dueDate: string | null; // "YYYY-MM-DD" | null
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
  const toast = useToast();

  const [items, setItems] = useState<TaskItem[]>(initial);
  const [overId, setOverId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  useEffect(() => setItems(initial), [initial]);

  const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  async function handleDelete(id: string) {
    const prev = items;
    const next: TaskItem[] = prev.filter((t) => t.id !== id);
    setItems(next);

    try {
      await deleteTask(id);
      toast({ variant: "success", title: "Task deleted" });
    } catch (err) {
      console.error(err);
      setItems(prev);
      toast({
        variant: "error",
        title: "Couldn’t delete",
        description: "Network or server error.",
      });
    }
  }

  async function handleToggleComplete(id: string, nextDone: boolean) {
    const prev = items;

    const nextStatus: TaskItem["status"] = nextDone ? "DONE" : "TODO";
    let next: TaskItem[] = prev.map((t) =>
      t.id === id ? { ...t, status: nextStatus } : t
    );

    if (nextStatus === "DONE" && view !== "done") {
      next = next.filter((t) => t.id !== id);
    }
    if (nextStatus !== "DONE" && view === "done") {
      next = next.filter((t) => t.id !== id);
    }

    setItems(next);

    try {
      await updateTask(id, { status: nextStatus });
    } catch (err) {
      console.error(err);
      setItems(prev);
      toast({
        variant: "error",
        title: "Update failed",
        description: "Couldn’t toggle completion.",
      });
    }
  }

  async function handleTitleChange(id: string, nextTitle: string) {
    const prev = items;
    const next: TaskItem[] = prev.map((t) =>
      t.id === id ? { ...t, title: nextTitle } : t
    );
    setItems(next);

    try {
      await updateTask(id, { title: nextTitle });
      return true;
    } catch (err) {
      console.error(err);
      setItems(prev);
      toast({
        variant: "error",
        title: "Update failed",
        description: "Couldn’t save title.",
      });
      return false;
    }
  }

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
    const in7 = addDays(7);

    const buckets: { key: string; label: string; rows: TaskItem[] }[] = [
      { key: "overdue", label: "Overdue", rows: [] },
      { key: "today", label: "Today", rows: [] },
      { key: "week", label: "This Week", rows: [] },
      { key: "later", label: "Later", rows: [] },
      { key: "nodate", label: "No date", rows: [] },
    ];

    for (const t of items) {
      if (!t.dueDate) {
        buckets[4].rows.push(t);
        continue;
      }
      const due = new Date(t.dueDate);
      due.setHours(0, 0, 0, 0);

      if (due < midnight) buckets[0].rows.push(t);
      else if (due.getTime() === midnight.getTime()) buckets[1].rows.push(t);
      else if (due > midnight && due < in7) buckets[2].rows.push(t);
      else buckets[3].rows.push(t);
    }
    return buckets.filter((b) => b.rows.length > 0);
  }, [items, view]);

  const hasAny = view === "all" ? (grouped?.length ?? 0) > 0 : items.length > 0;

  const ACCENT_SECTIONS = new Set([
    "Overdue",
    "Today",
    "This Week",
    "Later",
    "No date",
  ]);

  const SectionHeaderRow = ({ label }: { label: string }) => {
    const isAccent = ACCENT_SECTIONS.has(label);
    return (
      <tr
        className="text-xs uppercase tracking-wide"
        style={
          isAccent
            ? {
                background:
                  "color-mix(in oklab, var(--twc-accent) 18%, var(--twc-surface))",
                color: "var(--twc-text)",
              }
            : {
                background:
                  "color-mix(in oklab, var(--twc-text) 6%, var(--twc-surface))",
                color: "color-mix(in oklab, var(--twc-text) 70%, transparent)",
              }
        }
      >
        {[
          <td key="drag" className="w-6 py-2 pr-2" />,
          <td key="chk" className="w-10 py-2 pr-2" />,
          <td key="label" className="py-2 pr-4">
            {label}
          </td>,
          <td key="due" className="py-2 pr-4" />,
          <td key="actions" className="py-2 pr-0 text-right" />,
        ]}
      </tr>
    );
  };

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

    setItems((curr): TaskItem[] => {
      const oldIndex = curr.findIndex((x) => x.id === active.id);
      const newIndex = curr.findIndex((x) => x.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return curr.slice();

      const clone = curr.slice();
      const [moved] = clone.splice(oldIndex, 1);
      clone.splice(newIndex, 0, moved);

      const optimistic: TaskItem[] = clone.map((t, i) => ({
        ...t,
        position: i + 1,
      }));

      reorderTasks({
        items: optimistic.map(({ id }, i) => ({ id, position: i + 1 })),
      }).catch((err) => {
        console.error(err);
        toast({
          variant: "error",
          title: "Reorder failed",
          description: "We’ll try again shortly.",
        });
      });

      return optimistic;
    });
  }

  function StaticRow({ t, isLast }: { t: TaskItem; isLast: boolean }) {
    const isDone = t.status === "DONE";
    const isOverdue =
      !!t.dueDate &&
      new Date(t.dueDate).setHours(0, 0, 0, 0) <
        new Date(new Date().setHours(0, 0, 0, 0)).getTime() &&
      !isDone;

    return (
      <tr
        key={t.id}
        className="group"
        style={{
          borderBottom: isLast
            ? "none"
            : "1px solid color-mix(in oklab, var(--twc-text) 10%, transparent)",
        }}
      >
        {[
          <td key="drag" className="w-6 py-3 pr-2 align-middle">
            <span
              aria-hidden
              className="inline-flex p-1"
              style={{
                color: "color-mix(in oklab, var(--twc-text) 60%, transparent)",
              }}
            >
              <GripVertical className="h-4 w-4 opacity-40" />
            </span>
          </td>,
          <td key="chk" className="w-10 py-3 pr-2 align-middle">
            <RowComplete
              id={t.id}
              completed={isDone}
              onToggle={(next) => handleToggleComplete(t.id, next)}
            />
          </td>,
          <td key="title" className="py-3 pr-4 align-middle">
            <InlineTitle
              id={t.id}
              title={cap(t.title)}
              done={isDone}
              onChange={(next) => handleTitleChange(t.id, next)}
            />
          </td>,
          <td
            key="due"
            className="py-3 pr-4 align-middle"
            style={{ color: isOverdue ? "var(--twc-danger)" : undefined }}
          >
            <InlineDueDate id={t.id} due={t.dueDate} done={isDone} />
          </td>,
          <td key="actions" className="py-3 pr-0 text-right align-middle">
            <RowActions onDelete={() => handleDelete(t.id)} />
          </td>,
        ]}
      </tr>
    );
  }

  function SortableRow({ t, isLast }: { t: TaskItem; isLast: boolean }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: t.id, animateLayoutChanges: () => false });

    const setRowRef = (node: HTMLTableRowElement | null) =>
      setNodeRef(node as unknown as HTMLElement | null);

    const baseTransform = CSS.Transform.toString(transform);
    const style: React.CSSProperties = {
      transform: isDragging
        ? `${baseTransform} scale(0.998)`
        : baseTransform || undefined,
      transition: transition || "transform 150ms ease",
      boxShadow: isDragging ? "0 1px 4px rgba(0,0,0,0.08)" : undefined,
      backgroundColor: "transparent",
      borderBottom: isLast
        ? "none"
        : "1px solid color-mix(in oklab, var(--twc-text) 10%, transparent)",
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
        ref={setRowRef}
        style={{
          ...style,
          outline: isDropTarget
            ? "2px solid color-mix(in oklab, var(--twc-text) 20%, transparent)"
            : "none",
          outlineOffset: "-2px",
        }}
        key={t.id}
        className="group"
      >
        {[
          <td key="drag" className="w-6 py-3 pr-2 align-middle">
            <button
              type="button"
              className="cursor-grab rounded p-1 active:cursor-grabbing"
              title="Drag to reorder"
              aria-label="Drag to reorder"
              {...attributes}
              {...listeners}
              style={{
                color: "color-mix(in oklab, var(--twc-text) 60%, transparent)",
              }}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          </td>,
          <td key="chk" className="w-10 py-3 pr-2 align-middle">
            <RowComplete
              id={t.id}
              completed={isDone}
              onToggle={(next) => handleToggleComplete(t.id, next)}
            />
          </td>,
          <td key="title" className="py-3 pr-4 align-middle">
            <InlineTitle
              id={t.id}
              title={cap(t.title)}
              done={isDone}
              onChange={(next) => handleTitleChange(t.id, next)}
            />
          </td>,
          <td
            key="due"
            className="py-3 pr-4 align-middle"
            style={{ color: isOverdue ? "var(--twc-danger)" : undefined }}
          >
            <InlineDueDate id={t.id} due={t.dueDate} done={isDone} />
          </td>,
          <td key="actions" className="py-3 pr-0 text-right align-middle">
            <RowActions onDelete={() => handleDelete(t.id)} />
          </td>,
        ]}
      </tr>
    );
  }

  const renderRowsStatic = (rows: TaskItem[]) => (
    <>
      {rows.map((t, idx) => (
        <StaticRow key={t.id} t={t} isLast={idx === rows.length - 1} />
      ))}
    </>
  );

  const renderRowsSortable = (rows: TaskItem[]) => (
    <SortableContext
      items={rows.map((r) => r.id)}
      strategy={verticalListSortingStrategy}
    >
      {rows.map((t, idx) => (
        <SortableRow key={t.id} t={t} isLast={idx === rows.length - 1} />
      ))}
    </SortableContext>
  );

  const Header = () => (
    <thead>
      <tr
        className="text-left"
        style={{
          color: "color-mix(in oklab, var(--twc-text) 65%, transparent)",
          borderBottom:
            "1px solid color-mix(in oklab, var(--twc-text) 12%, transparent)",
          backgroundColor: "transparent",
        }}
      >
        {[
          <th key="drag" className="w-6 py-2 pr-2" />,
          <th key="chk" className="w-10 py-2 pr-2" />,
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

  const EmptyBlock = () => {
    const isDoneView = view === "done";
    return (
      <div className="flex w-full items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3 text-center">
          {isDoneView ? (
            <CheckCircle2
              className="h-8 w-8"
              aria-hidden
              style={{ color: "var(--twc-accent)" }}
            />
          ) : (
            <ClipboardList
              className="h-8 w-8"
              aria-hidden
              style={{
                color: "color-mix(in oklab, var(--twc-text) 40%, transparent)",
              }}
            />
          )}
          <div className="font-medium" style={{ color: "var(--twc-text)" }}>
            {isDoneView ? "No completed tasks yet" : "No tasks yet"}
          </div>
          <div
            className="text-sm"
            style={{
              color: "color-mix(in oklab, var(--twc-text) 60%, transparent)",
            }}
          >
            {isDoneView ? (
              "Finish a task and it will show up here."
            ) : (
              <>
                Add your first task below — try typing <em>“tomorrow”</em> or{" "}
                <em>“mon”</em> to set a due date quickly.
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto" data-tt="tasks-table-themed-no-row-bg">
      {hasAny ? (
        <>
          {!hydrated && (
            <table className="w-full text-sm">
              <Header />
              {view !== "all" && <tbody>{renderRowsStatic(items)}</tbody>}
              {view === "all" &&
                grouped!.map((sec) => (
                  <tbody key={sec.key}>
                    <SectionHeaderRow label={sec.label} />
                    {renderRowsStatic(sec.rows)}
                  </tbody>
                ))}
            </table>
          )}

          {hydrated && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragOver={onDragOver}
              onDragCancel={onDragCancel}
              onDragEnd={onDragEnd}
            >
              <table className="w-full text-sm">
                <Header />
                {view !== "all" && <tbody>{renderRowsSortable(items)}</tbody>}
                {view === "all" &&
                  grouped!.map((sec) => (
                    <tbody key={sec.key}>
                      <SectionHeaderRow label={sec.label} />
                      {renderRowsSortable(sec.rows)}
                    </tbody>
                  ))}
              </table>
            </DndContext>
          )}
        </>
      ) : (
        <EmptyBlock />
      )}
    </div>
  );
}
