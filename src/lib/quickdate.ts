/**
 * Tiny date parser for natural phrases:
 *  - "today", "tomorrow"
 *  - "fri", "mon", ... (short weekday names)
 *  - "in 2 days"
 *
 * Returns ISO date string "YYYY-MM-DD" or null if no match.
 */
export function parseQuickDate(input: string): string | null {
  const lower = input.toLowerCase().trim();
  const today = new Date();

  if (lower.includes("today")) return toISODate(today);

  if (lower.includes("tomorrow")) {
    const d = addDays(today, 1);
    return toISODate(d);
  }

  const inDays = lower.match(/\bin\s+(\d+)\s+day[s]?\b/);
  if (inDays) {
    const d = addDays(today, parseInt(inDays[1], 10));
    return toISODate(d);
  }

  const map: Record<string, number> = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  };
  const wd = lower.match(/\b(sun|mon|tue|wed|thu|fri|sat)\b/);
  if (wd) {
    return toISODate(nextDay(today, map[wd[1]]));
  }

  return null;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function nextDay(date: Date, dayOfWeek: number) {
  const d = new Date(date);
  const diff = (dayOfWeek + 7 - d.getDay()) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d;
}

function toISODate(date: Date) {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}
