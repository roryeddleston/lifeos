// Keep your existing formatDateGB
export function formatDateGB(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString("en-GB"); // DD/MM/YYYY
}

// New: due date label logic
export function formatDueLabel(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);

  // Normalize to local midnight for comparisons
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(d);
  due.setHours(0, 0, 0, 0);

  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((due.getTime() - today.getTime()) / msPerDay);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays >= 2 && diffDays <= 6) {
    // e.g. Mon, Tue...
    return due.toLocaleDateString("en-GB", { weekday: "short" });
  }
  // Fallback to GB date
  return formatDateGB(due);
}
