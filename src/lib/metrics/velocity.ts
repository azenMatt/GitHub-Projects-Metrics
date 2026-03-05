import { ProjectData } from "../github/types";

export interface VelocityBar {
  iteration: string;
  completed: number;
  total: number;
}

/**
 * Compute velocity — items completed per iteration.
 * An item is "completed" if it has a closedAt date.
 */
export function computeVelocity(data: ProjectData): VelocityBar[] {
  const iterMap = new Map<string, { completed: number; total: number }>();

  // Initialize all iterations
  for (const iter of data.iterations) {
    iterMap.set(iter.title, { completed: 0, total: 0 });
  }

  // Count items per iteration
  for (const item of data.items) {
    if (!item.iteration) continue;
    const entry = iterMap.get(item.iteration.title);
    if (!entry) continue;
    entry.total++;
    if (item.content && "closedAt" in item.content && item.content.closedAt) {
      entry.completed++;
    }
  }

  return data.iterations.map((iter) => ({
    iteration: iter.title,
    completed: iterMap.get(iter.title)?.completed ?? 0,
    total: iterMap.get(iter.title)?.total ?? 0,
  }));
}
