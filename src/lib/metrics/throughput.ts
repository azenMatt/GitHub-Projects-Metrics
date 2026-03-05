import { ProjectData } from "../github/types";

export interface ThroughputWeek {
  weekStart: string; // YYYY-MM-DD
  count: number;
  rollingAvg: number | null;
}

/**
 * Compute weekly throughput — items completed (closed) per week,
 * with a 4-week rolling average.
 */
export function computeThroughput(data: ProjectData): ThroughputWeek[] {
  const weekMap = new Map<string, number>();

  for (const item of data.items) {
    if (!item.content) continue;
    if (item.content.__typename === "DraftIssue") continue;
    if (!item.content.closedAt) continue;

    const week = getWeekStart(new Date(item.content.closedAt));
    weekMap.set(week, (weekMap.get(week) ?? 0) + 1);
  }

  if (weekMap.size === 0) return [];

  // Fill in gaps between min and max weeks
  const sortedWeeks = Array.from(weekMap.keys()).sort();
  const start = new Date(sortedWeeks[0]);
  const end = new Date(sortedWeeks[sortedWeeks.length - 1]);
  const allWeeks: string[] = [];

  const cursor = new Date(start);
  while (cursor <= end) {
    allWeeks.push(cursor.toISOString().split("T")[0]);
    cursor.setDate(cursor.getDate() + 7);
  }

  const raw = allWeeks.map((w) => ({
    weekStart: w,
    count: weekMap.get(w) ?? 0,
  }));

  // Compute 4-week rolling average
  const WINDOW = 4;
  return raw.map((entry, i) => {
    if (i < WINDOW - 1) {
      return { ...entry, rollingAvg: null };
    }
    const windowSlice = raw.slice(i - WINDOW + 1, i + 1);
    const avg =
      Math.round(
        (windowSlice.reduce((s, e) => s + e.count, 0) / WINDOW) * 10
      ) / 10;
    return { ...entry, rollingAvg: avg };
  });
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}
