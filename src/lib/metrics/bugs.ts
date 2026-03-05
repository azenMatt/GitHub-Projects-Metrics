import { ProjectData } from "../github/types";

export interface BugsWeek {
  weekStart: string; // YYYY-MM-DD (Monday)
  opened: number;
  closed: number;
}

/**
 * Compute bugs opened vs closed per week.
 * Filters issues by issue type "Bug" (case-insensitive).
 */
export function computeBugs(data: ProjectData): BugsWeek[] {
  const weekMap = new Map<string, { opened: number; closed: number }>();

  for (const item of data.items) {
    if (!item.content) continue;
    if (item.content.__typename !== "Issue") continue;

    const isBug = item.content.issueType?.toLowerCase() === "bug";
    if (!isBug) continue;

    // Opened
    const openedWeek = getWeekStart(new Date(item.content.createdAt));
    const ow = weekMap.get(openedWeek) ?? { opened: 0, closed: 0 };
    ow.opened++;
    weekMap.set(openedWeek, ow);

    // Closed
    if (item.content.closedAt) {
      const closedWeek = getWeekStart(new Date(item.content.closedAt));
      const cw = weekMap.get(closedWeek) ?? { opened: 0, closed: 0 };
      cw.closed++;
      weekMap.set(closedWeek, cw);
    }
  }

  // Sort by week
  const weeks = Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, counts]) => ({ weekStart, ...counts }));

  return weeks;
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}
