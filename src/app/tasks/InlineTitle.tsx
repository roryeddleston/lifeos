"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { useToast } from "@/components/ui/Toaster";

const capSentence = (str: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : str;

export default function InlineTitle({
  id,
  title,
  done,
}: {
  id: string;
  title: string;
  done: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(title);
  const router = useRouter();
  const toast = useToast();
  const ref = useRef<HTMLInputElement>(null);

  async function save() {
    const next = capSentence(val.trim());
    setEditing(false);
    if (next === title) return;
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: next }),
    });
    if (!res.ok) {
      toast({
        variant: "error",
        title: "Update failed",
        description: `HTTP ${res.status}`,
      });
      setVal(title);
      return;
    }
    startTransition(() => router.refresh());
    setVal(next);
  }

  if (!editing) {
    return (
      <button
        onClick={() => {
          setEditing(true);
          setTimeout(() => ref.current?.focus(), 0);
        }}
        className={`text-left w-full ${
          done ? "line-through text-gray-500" : ""
        }`}
        aria-label="Edit title"
      >
        {capSentence(val)}
      </button>
    );
  }

  return (
    <input
      ref={ref}
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") {
          setVal(title);
          setEditing(false);
        }
      }}
      className="w-full bg-transparent border-b border-gray-300 focus:outline-none"
    />
  );
}
