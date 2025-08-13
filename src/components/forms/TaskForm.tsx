"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, type TaskInput } from "@/lib/validation";
import Input from "@/components/forms/Input";
import Textarea from "@/components/forms/Textarea";
import { useToast } from "@/components/ui/Toaster";

export default function TaskForm() {
  const router = useRouter();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: { status: "TODO" }, // keep default for API/schema compatibility
  });

  const onSubmit = async (data: TaskInput) => {
    try {
      setSubmitting(true);
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("POST /api/tasks failed:", res.status, text);
        toast({
          variant: "error",
          title: "Could not create task",
          description: `HTTP ${res.status}`,
        });
        return;
      }

      toast({ variant: "success", title: "Task created" });
      router.push("/tasks");
      router.refresh?.();
    } catch (e) {
      console.error(e);
      toast({
        variant: "error",
        title: "Network error",
        description: "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
      <Input
        label="Title"
        placeholder="e.g. Hook up Prisma client"
        {...register("title")}
        error={errors.title?.message}
      />

      <Textarea
        label="Description"
        rows={4}
        placeholder="Optional details…"
        {...register("description")}
        error={errors.description?.message}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          type="date"
          label="Due date"
          {...register("dueDate")}
          error={errors.dueDate?.message}
        />
        {/* spacer */}
        <div />
      </div>

      {/* Hidden native select to satisfy schema/API but keep UI minimal */}
      <select className="hidden" {...register("status")}>
        <option value="TODO">TODO</option>
        <option value="IN_PROGRESS">IN_PROGRESS</option>
        <option value="DONE">DONE</option>
      </select>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-gray-900 text-white px-4 py-2 text-sm hover:bg-black disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Create Task"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
