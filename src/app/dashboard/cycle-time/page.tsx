"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { computeCycleTime, computeCycleTimeStats } from "@/lib/metrics/cycleTime";
import CycleTimeChart from "@/components/charts/CycleTimeChart";
import ReportDescription from "@/components/ReportDescription";

export default function CycleTimePage() {
  const { projectData } = useStore();

  const cycleTimeData = useMemo(() => {
    if (!projectData) return [];
    return computeCycleTime(projectData);
  }, [projectData]);

  const stats = useMemo(
    () => computeCycleTimeStats(cycleTimeData),
    [cycleTimeData]
  );

  return (
    <div>
      <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Cycle Time</h2>

      <CycleTimeChart data={cycleTimeData} stats={stats} />
      <ReportDescription
        how="Measures the time between issue creation and issue close for each item. Only closed items are included."
        why="Use this to identify how long work typically takes to complete. Items above the 85th percentile line are outliers worth investigating. A downward trend indicates improving delivery speed."
      />
    </div>
  );
}
