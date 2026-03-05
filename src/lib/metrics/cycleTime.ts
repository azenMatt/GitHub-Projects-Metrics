import { ProjectData, ProjectItem } from "../github/types";

export interface CycleTimeItem {
  title: string;
  number: number | null;
  url: string | null;
  cycleDays: number;
  startDate: string;
  endDate: string;
}

export interface CycleTimeOptions {
  startAt: "created" | string;  // "created" or a status name
  endAt: "closed" | string;     // "closed" or a status name
  statusOrder: string[];        // ordered list of statuses from project
}

/**
 * Compute cycle time per item.
 *
 * Start: "created" uses createdAt. A status name filters to items that have
 * reached at least that status (based on statusOptions order).
 *
 * End: "closed" uses closedAt. A status name filters to items currently in
 * that status (or later) and uses closedAt if available, otherwise updatedAt.
 */
export function computeCycleTime(
  data: ProjectData,
  options: CycleTimeOptions = { startAt: "created", endAt: "closed", statusOrder: [] }
): CycleTimeItem[] {
  const results: CycleTimeItem[] = [];
  const { startAt, endAt, statusOrder } = options;

  const statusIndex = new Map(statusOrder.map((s, i) => [s.toLowerCase(), i]));

  for (const item of data.items) {
    if (!item.content) continue;
    if (item.content.__typename === "DraftIssue") continue;

    // Determine if item qualifies based on end condition
    const endDate = getEndDate(item, endAt, statusIndex);
    if (!endDate) continue;

    // Determine if item qualifies based on start condition
    if (startAt !== "created") {
      if (!hasReachedStatus(item, startAt, statusIndex)) continue;
    }

    const startDateStr = item.content.createdAt;
    const startDate = new Date(startDateStr).getTime();
    const end = new Date(endDate).getTime();
    const cycleDays = Math.round(((end - startDate) / (1000 * 60 * 60 * 24)) * 10) / 10;

    results.push({
      title: item.content.title,
      number: item.content.number,
      url: item.content.url,
      cycleDays: Math.max(0, cycleDays),
      startDate: startDateStr,
      endDate,
    });
  }

  results.sort(
    (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
  );

  return results;
}

function getEndDate(
  item: ProjectItem,
  endAt: string,
  statusIndex: Map<string, number>
): string | null {
  if (endAt === "closed") {
    if (!item.content || item.content.__typename === "DraftIssue") return null;
    return item.content.closedAt;
  }
  // Status-based end: item must be at or past the target status
  if (!hasReachedStatus(item, endAt, statusIndex)) return null;
  // Use closedAt if available, otherwise updatedAt
  if (item.content && item.content.__typename !== "DraftIssue" && item.content.closedAt) {
    return item.content.closedAt;
  }
  return item.content?.updatedAt ?? null;
}

function hasReachedStatus(
  item: ProjectItem,
  targetStatus: string,
  statusIndex: Map<string, number>
): boolean {
  if (!item.status) return false;
  const targetIdx = statusIndex.get(targetStatus.toLowerCase());
  const currentIdx = statusIndex.get(item.status.toLowerCase());
  if (targetIdx === undefined || currentIdx === undefined) {
    return item.status.toLowerCase() === targetStatus.toLowerCase();
  }
  return currentIdx >= targetIdx;
}

export function computeCycleTimeStats(items: CycleTimeItem[]) {
  if (items.length === 0) return { avg: 0, median: 0, p85: 0 };
  const sorted = [...items].sort((a, b) => a.cycleDays - b.cycleDays);
  const avg = Math.round((sorted.reduce((s, i) => s + i.cycleDays, 0) / sorted.length) * 10) / 10;
  const median = sorted[Math.floor(sorted.length / 2)].cycleDays;
  const p85 = sorted[Math.floor(sorted.length * 0.85)].cycleDays;
  return { avg, median, p85 };
}
