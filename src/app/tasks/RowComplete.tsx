"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toaster";

export default function RowComplete({
  id,
  completed,
}: {
  id: string;
  completed: boolean;
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
      startTransition(() => router.refresh());
    } catch (e) {
      console.error(e);
      setChecked(!next); // revert
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
