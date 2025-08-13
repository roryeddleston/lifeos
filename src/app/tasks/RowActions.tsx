"use client";

export default function RowActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  return (
    <div className="flex justify-end gap-2">
      <button className="text-xs text-blue-600 hover:underline">Edit</button>
      <button className="text-xs text-red-600 hover:underline">Delete</button>
    </div>
  );
}
