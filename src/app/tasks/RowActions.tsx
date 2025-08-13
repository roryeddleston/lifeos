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
          title: "Could not delete",
          description: `HTTP ${res.status}`,
        });
        return;
      }
      startTransition(() => router.refresh());
      toast({
        variant: "success",
        title: "Task deleted",
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              const resp = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, dueDate, status: "TODO" }),
              });
              if (!resp.ok) {
                const txt = await resp.text().catch(() => "");
                console.error("Undo create failed:", resp.status, txt);
                return;
              }
              startTransition(() => router.refresh());
            } catch (e) {
              console.error("Undo create error:", e);
            }
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
    <div className="flex items-center justify-end">
      <button
        onClick={handleDelete}
        disabled={loading}
        className="inline-flex items-center rounded p-1 text-red-600/70 hover:text-red-700 focus:text-red-700 transition-colors disabled:opacity-50"
        aria-label={`Delete task “${title}”`}
        title="Delete"
      >
        <Trash2 size={16} aria-hidden />
      </button>
    </div>
  );
}
