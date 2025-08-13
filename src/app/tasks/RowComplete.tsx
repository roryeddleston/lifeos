"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { useToast } from "@/components/ui/Toaster";

export default function RowComplete({
  id,
  completed,
  onToggle,
}: {
  id: string;
  completed: boolean;
  onToggle?: (next: boolean) => void; // notify parent to remove row if needed
}) {
  const router = useRouter();
  const toast = useToast();
  const [checked, setChecked] = useState(completed);
  const [loading, setLoading] = useState(false);

  async function toggle(next: boolean) {
    if (loading) return;
    setChecked(next); // optimistic
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next ? "DONE" : "TODO" }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("PATCH /api/tasks/:id failed:", res.status, text);
        setChecked(!next); // revert
        toast({
          variant: "error",
          title: "Update failed",
          description: `HTTP ${res.status}`,
        });
        return;
      }

      onToggle?.(next); // let parent decide if it should remove the row
      startTransition(() => router.refresh());
    } catch (e) {
      console.error(e);
      setChecked(!next);
      toast({
        variant: "error",
        title: "Network error",
        description: "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <input
      type="checkbox"
      className="h-4 w-4 accent-gray-900"
      checked={checked}
      onChange={(e) => toggle(e.target.checked)}
      aria-label={checked ? "Mark as not done" : "Mark as done"}
    />
  );
}
