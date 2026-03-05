import { ProjectData, ProjectItem } from "../github/types";

export interface BurndownPoint {
  date: string; // YYYY-MM-DD
  remaining: number;
  ideal: number;
}

/**
 * Generate burndown data for a specific iteration.
 * Shows remaining (not "Done") items per day.
 */
export function computeBurndown(
  data: ProjectData,
  iterationTitle: string
): BurndownPoint[] {
  const iteration = data.iterations.find((i) => i.title === iterationTitle);
  if (!iteration) return [];

  const start = new Date(iteration.startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + iteration.duration);

  // Items assigned to this iteration
  const iterItems = data.items.filter(
    (item) => item.iteration?.title === iterationTitle
  );

  const totalItems = iterItems.length;
  if (totalItems === 0) return [];

  // Build day-by-day burndown
  const points: BurndownPoint[] = [];
  const days = iteration.duration;

  for (let d = 0; d <= days; d++) {
    const date = new Date(start);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().split("T")[0];

    // Count items completed (closed) on or before this date
    const completedByDate = iterItems.filter((item) => {
      const closedAt = getClosedAt(item);
      if (!closedAt) return false;
      return new Date(closedAt) <= date;
    }).length;

    const remaining = totalItems - completedByDate;
    const ideal = totalItems - (totalItems / days) * d;

    points.push({
      date: dateStr,
      remaining,
      ideal: Math.max(0, Math.round(ideal * 10) / 10),
    });
  }

  return points;
}

function getClosedAt(item: ProjectItem): string | null {
  if (!item.content) return null;
  if (item.content.__typename === "DraftIssue") return null;
  return item.content.closedAt;
}
