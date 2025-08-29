"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toaster";
import TrashButton from "@/components/ui/TrashButton";

export default function RowActions({
  id,
  title,
  dueDate,
}: {
  id: string;
  title: string;
  dueDate: string | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("DELETE /api/tasks/:id failed:", res.status, text);
        toast({
          variant: "error",
          title: "Couldn’t delete",
          description: `HTTP ${res.status}`,
        });
        setLoading(false);
        return;
      }

      startTransition(() => router.refresh());

      toast({
        variant: "success",
        title: "Task deleted",
        action: {
          label: "Undo",
          onClick: async () => {
            const body = { title, dueDate, status: "TODO" };
            const r = await fetch("/api/tasks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
            if (!r.ok) {
              toast({
                variant: "error",
                title: "Undo failed",
                description: `HTTP ${r.status}`,
              });
              return;
            }
            startTransition(() => router.refresh());
          },
        },
      });
    } catch (e) {
      console.error(e);
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
    <div className="flex items-center justify-end gap-1">
      <TrashButton
        onClick={handleDelete}
        disabled={loading}
        aria-label="Delete task"
        title="Delete task"
      />
    </div>
  );
}
