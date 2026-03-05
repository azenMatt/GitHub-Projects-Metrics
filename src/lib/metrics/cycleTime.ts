import { ProjectData, StatusTransitionMap } from "../github/types";

export interface CycleTimeItem {
  title: string;
  number: number | null;
  url: string | null;
  issueType: string | null;
  cycleDays: number;
  startDate: string;
  endDate: string;
}

export interface CycleTimeOptions {
  startAt?: "created" | string;
  transitionMap?: StatusTransitionMap;
}

/**
 * Compute cycle time per item.
 *
 * When startAt is "created" (default), uses createdAt → closedAt.
 * When startAt is a status name, uses the first timestamp the item entered
 * that status (from transitionMap) → closedAt. Items without a matching
 * transition are excluded.
 */
export function computeCycleTime(
  data: ProjectData,
  options: CycleTimeOptions = {}
): CycleTimeItem[] {
  const { startAt = "created", transitionMap } = options;
  const results: CycleTimeItem[] = [];

  for (const item of data.items) {
    if (!item.content) continue;
    if (item.content.__typename === "DraftIssue") continue;
    if (!item.content.closedAt) continue;

    const issueType =
      item.content.__typename === "Issue" ? item.content.issueType ?? null : null;

    let startDateStr: string;
    if (startAt === "created") {
      startDateStr = item.content.createdAt;
    } else {
      // Look up when this item first entered the selected status
      const transitions = transitionMap?.get(item.content.id);
      const ts = transitions?.get(startAt);
      if (!ts) continue; // no transition found — skip item
      startDateStr = ts;
    }

    const startDate = new Date(startDateStr).getTime();
    const endDate = new Date(item.content.closedAt).getTime();
    const cycleDays = Math.round(((endDate - startDate) / (1000 * 60 * 60 * 24)) * 10) / 10;

    results.push({
      title: item.content.title,
      number: item.content.number,
      url: item.content.url,
      issueType,
      cycleDays: Math.max(0, cycleDays),
      startDate: startDateStr,
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
