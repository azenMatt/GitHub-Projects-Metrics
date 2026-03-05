"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { computeBurndown } from "@/lib/metrics/burndown";
import BurndownChart from "@/components/charts/BurndownChart";
import IterationSelector from "@/components/IterationSelector";
import ReportDescription from "@/components/ReportDescription";

export default function BurndownPage() {
  const { projectData } = useStore();
  const [selectedIteration, setSelectedIteration] = useState<string | null>(
    () => {
      // Default to the last iteration
      const iters = projectData?.iterations ?? [];
      return iters.length > 0 ? iters[iters.length - 1].title : null;
    }
  );

  const burndownData = useMemo(() => {
    if (!projectData || !selectedIteration) return [];
    return computeBurndown(projectData, selectedIteration);
  }, [projectData, selectedIteration]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-sm font-medium text-[var(--text-secondary)]">Burndown Chart</h2>
        <IterationSelector
          value={selectedIteration}
          onChange={setSelectedIteration}
        />
      </div>
      <BurndownChart
        data={burndownData}
        iterationTitle={selectedIteration ?? ""}
      />
      <ReportDescription
        how="Counts the total items assigned to the selected iteration, then for each day plots how many remain unclosed. The ideal line shows a linear path from total items to zero across the iteration duration."
        why="Use this to track whether your team is on pace to complete the iteration. If the remaining line is above the ideal line, the sprint is behind schedule. A flat line indicates blocked or stalled work."
      />
    </div>
  );
}
