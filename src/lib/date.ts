// Format as GB date (DD/MM/YYYY)
export function formatDateGB(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString("en-GB");
}

// Friendly due label: Today / Tomorrow / Weekday (next 6) / GB date
export function formatDueLabel(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(d);
  due.setHours(0, 0, 0, 0);

  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((due.getTime() - today.getTime()) / msPerDay);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays >= 2 && diffDays <= 6) {
    return due.toLocaleDateString("en-GB", { weekday: "short" }); // Mon, Tue, ...
  }
  return formatDateGB(due);
}
