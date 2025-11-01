// src/components/goals/QuickAddGoal.tsx
"use client";

import { useState, useTransition } from "react";
import Card from "@/components/cards/Card";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toaster";
import AddActionButton from "@/components/ui/AddActionButton";
import { createGoal } from "@/app/goals/actions";

export default function QuickAddGoal() {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [targetValue, setTargetValue] = useState<number | "">("");
  const [unit, setUnit] = useState("");
  const [deadline, setDeadline] = useState<string>("");

  const isValid =
    title.trim().length > 0 &&
    unit.trim().length > 0 &&
    targetValue !== "" &&
    Number(targetValue) > 0;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    const payload = {
      title: title.trim(),
      targetValue:
        typeof targetValue === "number" ? targetValue : Number(targetValue),
      unit: unit.trim(),
      deadline: deadline || null,
    };

    startTransition(async () => {
      try {
        await createGoal(payload);
        setTitle("");
        setTargetValue("");
        setUnit("");
        setDeadline("");
        router.refresh();
        toast({ variant: "success", title: "Goal added" });
      } catch {
        toast({ variant: "error", title: "Add goal failed" });
      }
    });
  }

  const inputBase =
    "mt-1 w-full rounded-md px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--twc-accent)]";
  const inputStyles = {
    border: "1px solid var(--twc-border)",
    color: "var(--twc-text)",
    backgroundColor: "var(--twc-surface)",
  } as React.CSSProperties;

  return (
    <Card className="p-4">
      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 gap-3 md:grid-cols-5"
      >
        <div className="md:col-span-2">
          <label
            className="block text-xs"
            style={{ color: "var(--twc-muted)" }}
          >
            Goal
          </label>
          <input
            type="text"
            placeholder="Run 100km"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputBase}
            style={inputStyles}
            required
          />
        </div>

        <div>
          <label
            className="block text-xs"
            style={{ color: "var(--twc-muted)" }}
          >
            Target
          </label>
          <input
            type="number"
            min={1}
            placeholder="100"
            value={targetValue}
            onChange={(e) =>
              setTargetValue(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            className={inputBase}
            style={inputStyles}
            required
          />
        </div>

        <div>
          <label
            className="block text-xs"
            style={{ color: "var(--twc-muted)" }}
          >
            Unit
          </label>
          <input
            type="text"
            placeholder="km"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className={inputBase}
            style={inputStyles}
            required
          />
        </div>

        <div>
          <label
            className="block text-xs"
            style={{ color: "var(--twc-muted)" }}
          >
            Deadline (optional)
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={inputBase}
            style={inputStyles}
          />
        </div>

        <div className="pt-4 md:col-span-5">
          <AddActionButton
            type="submit"
            disabled={isPending || !isValid}
            label="Add Goal"
          />
        </div>
      </form>
    </Card>
  );
}
