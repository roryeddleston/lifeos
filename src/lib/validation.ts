import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z
    .string()
    .max(500, "Max 500 characters")
    .optional()
    .or(z.literal("")),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
  dueDate: z.string().optional(), // we'll convert to Date server-side later
});

export type TaskInput = z.infer<typeof taskSchema>;
