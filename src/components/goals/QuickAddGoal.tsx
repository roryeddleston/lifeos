"use client";

import { useState, useTransition } from "react";
import Card from "@/components/cards/Card";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toaster";

export default function QuickAddGoal() {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [targetValue, setTargetValue] = useState<number | "">("");
  const [unit, setUnit] = useState("");
  const [deadline, setDeadline] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: title.trim(),
      targetValue:
        typeof targetValue === "number" ? targetValue : Number(targetValue),
      unit: unit.trim(),
      deadline: deadline || null,
    };
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("POST /api/goals failed:", res.status, text);
        toast({ variant: "error", title: "Add goal failed" });
        return;
      }
      setTitle("");
      setTargetValue("");
      setUnit("");
      setDeadline("");

      startTransition(() => router.refresh());
      toast({ variant: "success", title: "Goal added" });
    } catch (e) {
      console.error(e);
      toast({ variant: "error", title: "Network error" });
    }
  }

  return (
    <Card className="p-4">
      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 gap-3 md:grid-cols-5"
      >
        <div className="md:col-span-2">
          <label className="block text-xs text-gray-600">Goal</label>
          <input
            type="text"
            placeholder="Run 100km"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-300"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600">Target</label>
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
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-300"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600">Unit</label>
          <input
            type="text"
            placeholder="km"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-300"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600">
            Deadline (optional)
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-300"
          />
        </div>

        <div className="md:col-span-5">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
          >
            Add Goal
          </button>
        </div>
      </form>
    </Card>
  );
}
