"use client";

import { useState } from "react";
import TrashButton from "@/components/ui/TrashButton";

type RowActionsProps = {
  onDelete: () => Promise<void> | void;
  // kept for future use (e.g., auth/undo flows)
  id?: string;
  title?: string;
  dueDate?: string | null;
};

export default function RowActions({ onDelete }: RowActionsProps) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (loading) return;
    setLoading(true);
    try {
      await onDelete();
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
