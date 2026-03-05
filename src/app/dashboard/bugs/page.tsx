"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { computeBugs } from "@/lib/metrics/bugs";
import BugsChart from "@/components/charts/BugsChart";
import ReportDescription from "@/components/ReportDescription";

export default function BugsPage() {
  const { projectData } = useStore();

  const bugsData = useMemo(() => {
    if (!projectData) return [];
    return computeBugs(projectData);
  }, [projectData]);

  return (
    <div>
      <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-6">Bugs Opened vs Closed</h2>
      <BugsChart data={bugsData} />
      <ReportDescription
        how={`Filters issues that have the "Bug" issue type, then groups them into weekly buckets. The opened line counts bugs by their creation date, and the closed line counts by their closed date.`}
        why="Use this to monitor whether bugs are being resolved faster than they're being reported. When the opened line consistently exceeds the closed line, bug debt is growing and may need dedicated attention."
      />
    </div>
  );
}
