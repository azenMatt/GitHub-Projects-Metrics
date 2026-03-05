import { ProjectData } from "../github/types";

export interface CycleTimeItem {
  title: string;
  number: number | null;
  url: string | null;
  issueType: string | null;
  cycleDays: number;
  startDate: string;
  endDate: string;
}

/**
 * Compute cycle time per item as createdAt → closedAt.
 */
export function computeCycleTime(data: ProjectData): CycleTimeItem[] {
  const results: CycleTimeItem[] = [];

  for (const item of data.items) {
    if (!item.content) continue;
    if (item.content.__typename === "DraftIssue") continue;
    if (!item.content.closedAt) continue;

    const issueType =
      item.content.__typename === "Issue" ? item.content.issueType ?? null : null;

    const startDate = new Date(item.content.createdAt).getTime();
    const endDate = new Date(item.content.closedAt).getTime();
    const cycleDays = Math.round(((endDate - startDate) / (1000 * 60 * 60 * 24)) * 10) / 10;

    results.push({
      title: item.content.title,
      number: item.content.number,
      url: item.content.url,
      issueType,
      cycleDays: Math.max(0, cycleDays),
      startDate: item.content.createdAt,
      endDate: item.content.closedAt,
    });
  }

  results.sort(
    (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
  );

  return results;
}

/** Get the distinct set of issue types present in the data. */
export function getIssueTypes(items: CycleTimeItem[]): string[] {
  const types = new Set<string>();
  for (const item of items) {
    types.add(item.issueType ?? "None");
  }
  return [...types].sort();
}

export function computeCycleTimeStats(items: CycleTimeItem[]) {
  if (items.length === 0) return { avg: 0, median: 0, p85: 0 };
  const sorted = [...items].sort((a, b) => a.cycleDays - b.cycleDays);
  const avg = Math.round((sorted.reduce((s, i) => s + i.cycleDays, 0) / sorted.length) * 10) / 10;
  const median = sorted[Math.floor(sorted.length / 2)].cycleDays;
  const p85 = sorted[Math.floor(sorted.length * 0.85)].cycleDays;
  return { avg, median, p85 };
}
