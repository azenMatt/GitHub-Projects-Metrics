import { ProjectData } from "../github/types";

export interface AgingWipItem {
  title: string;
  number: number | null;
  ageDays: number;
  status: string;
  createdAt: string;
}

/**
 * Find items whose status is in the provided wipStatuses set and compute their age.
 * Excludes closed items. Sorted by age descending.
 */
export function computeAgingWip(
  data: ProjectData,
  wipStatuses: string[]
): AgingWipItem[] {
  const now = Date.now();
  const results: AgingWipItem[] = [];

  const wipSet = new Set(wipStatuses.map((s) => s.toLowerCase()));

  for (const item of data.items) {
    if (!item.status) continue;
    if (!wipSet.has(item.status.toLowerCase())) continue;

    // Skip if already closed
    if (item.content && item.content.__typename !== "DraftIssue" && item.content.closedAt) {
      continue;
    }

    const createdAt = item.content?.createdAt;
    if (!createdAt) continue;

    const ageDays =
      Math.round(((now - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)) * 10) / 10;

    results.push({
      title: item.content?.__typename === "DraftIssue"
        ? item.content.title
        : item.content?.title ?? "Untitled",
      number: item.content && item.content.__typename !== "DraftIssue"
        ? item.content.number
        : null,
      ageDays,
      status: item.status,
      createdAt,
    });
  }

  results.sort((a, b) => b.ageDays - a.ageDays);
  return results;
}

export type AgeSeverity = "green" | "yellow" | "red";

export function getAgeSeverity(days: number): AgeSeverity {
  if (days < 7) return "green";
  if (days < 14) return "yellow";
  return "red";
}

const WIP_DEFAULTS = new Set(["in progress", "in review"]);

/** Derive default WIP statuses — only include "In Progress" and "In Review" if they exist. */
export function getDefaultWipStatuses(statusOptions: string[]): string[] {
  const matches = statusOptions.filter((s) => WIP_DEFAULTS.has(s.toLowerCase()));
  return matches.length > 0 ? matches : [];
}
