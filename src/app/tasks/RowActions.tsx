"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toaster";
import { Trash2 } from "lucide-react";

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

      // Refresh in background
      startTransition(() => router.refresh());

      // Offer undo
      toast({
        variant: "success",
        title: "Task deleted",
        action: {
          label: "Undo",
          onClick: async () => {
            // You could re-create using cached data if desired
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
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="p-1 rounded cursor-pointer hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:opacity-50 inline-flex"
        aria-label="Delete task"
        title="Delete task"
      >
        <Trash2 className="w-4 h-4 text-red-600" />
      </button>
    </div>
  );
}
