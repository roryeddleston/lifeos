import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validate/shape the incoming PATCH body
const PatchSchema = z.object({
  title: z.string().min(1).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  dueDate: z.string().datetime().nullable().optional(), // ISO string or null
  position: z.number().int().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

// Typed update data for Prisma (converted from parsed schema)
type PrismaUpdateData = Partial<{
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate: Date | null;
  position: number;
}>;

export async function PATCH(req: Request, { params }: RouteParams) {
  const { id } = await params;
  const json = await req.json();
  const parsed = PatchSchema.parse(json);

  // Build a typed update object
  const data: PrismaUpdateData = {};
  if (parsed.title !== undefined) data.title = parsed.title;
  if (parsed.status !== undefined) data.status = parsed.status;
  if (parsed.position !== undefined) data.position = parsed.position;

  if (parsed.dueDate !== undefined) {
    data.dueDate = parsed.dueDate ? new Date(parsed.dueDate) : null;
  }

  const updated = await prisma.task.update({
    where: { id },
    data,
    select: {
      id: true,
      title: true,
      status: true,
      dueDate: true,
      position: true,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  await prisma.task.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}

export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const task = await prisma.task.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      status: true,
      dueDate: true,
      position: true,
    },
  });
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(task);
}
