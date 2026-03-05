import { ProjectData } from "../github/types";

export interface CfdDataPoint {
  label: string; // Iteration title or week start date
  counts: Record<string, number>; // status → count
}

export interface CfdSeries {
  labels: string[];
  statuses: string[];
  data: Record<string, number[]>; // status → array of counts per label
}

/**
 * Cumulative flow by iteration — count items in each status per iteration.
 */
export function computeCfdByIteration(data: ProjectData): CfdSeries {
  const statuses = data.statusOptions.length > 0
    ? data.statusOptions
    : deriveStatuses(data);

  const points: CfdDataPoint[] = data.iterations.map((iter) => {
    const counts: Record<string, number> = {};
    for (const s of statuses) counts[s] = 0;

    for (const item of data.items) {
      if (item.iteration?.title !== iter.title) continue;
      const status = item.status ?? "No Status";
      if (status in counts) {
        counts[status]++;
      } else {
        counts[status] = 1;
      }
    }

    return { label: iter.title, counts };
  });

  return toSeries(points, statuses);
}

/**
 * Cumulative flow by week — approximate status distribution over time.
 *
 * For each week boundary, we look at all items that existed by that date:
 * - If the item was closed on or before that date → "Done"
 * - Otherwise → use the item's current status (best approximation)
 */
export function computeCfdByWeek(data: ProjectData): CfdSeries {
  const statuses = data.statusOptions.length > 0
    ? data.statusOptions
    : deriveStatuses(data);

  // Find date range from all items
  const dates: number[] = [];
  for (const item of data.items) {
    if (item.content) {
      dates.push(new Date(item.content.createdAt).getTime());
    }
  }
  if (dates.length === 0) return { labels: [], statuses, data: {} };

  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(Date.now(), Math.max(...dates)));

  // Generate weekly boundaries
  const weekStart = getWeekStart(minDate);
  const weeks: Date[] = [];
  const cursor = new Date(weekStart);
  while (cursor <= maxDate) {
    weeks.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 7);
  }

  const doneStatus = statuses.find((s) => s.toLowerCase() === "done") ?? "Done";

  const points: CfdDataPoint[] = weeks.map((weekDate) => {
    const weekEnd = new Date(weekDate);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const counts: Record<string, number> = {};
    for (const s of statuses) counts[s] = 0;

    for (const item of data.items) {
      if (!item.content) continue;
      const created = new Date(item.content.createdAt);
      if (created > weekEnd) continue; // Didn't exist yet

      let status: string;
      if (
        item.content.__typename !== "DraftIssue" &&
        item.content.closedAt &&
        new Date(item.content.closedAt) <= weekEnd
      ) {
        status = doneStatus;
      } else {
        status = item.status ?? "No Status";
      }

      if (status in counts) {
        counts[status]++;
      } else {
        counts[status] = 1;
      }
    }

    return {
      label: weekDate.toISOString().split("T")[0],
      counts,
    };
  });

  return toSeries(points, statuses);
}

function toSeries(points: CfdDataPoint[], statuses: string[]): CfdSeries {
  const allStatuses = new Set(statuses);
  for (const p of points) {
    for (const s of Object.keys(p.counts)) {
      allStatuses.add(s);
    }
  }

  const statusList = Array.from(allStatuses);
  const seriesData: Record<string, number[]> = {};
  for (const s of statusList) {
    seriesData[s] = points.map((p) => p.counts[s] ?? 0);
  }

  return {
    labels: points.map((p) => p.label),
    statuses: statusList,
    data: seriesData,
  };
}

function deriveStatuses(data: ProjectData): string[] {
  const seen = new Set<string>();
  for (const item of data.items) {
    if (item.status) seen.add(item.status);
  }
  return Array.from(seen);
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
