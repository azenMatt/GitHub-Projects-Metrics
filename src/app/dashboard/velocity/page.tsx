"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { computeVelocity } from "@/lib/metrics/velocity";
import VelocityChart from "@/components/charts/VelocityChart";
import ReportDescription from "@/components/ReportDescription";

export default function VelocityPage() {
  const { projectData } = useStore();

  const velocityData = useMemo(() => {
    if (!projectData) return [];
    return computeVelocity(projectData);
  }, [projectData]);

  return (
    <div>
      <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-6">Velocity Chart</h2>
      <VelocityChart data={velocityData} />
      <ReportDescription
        how="For each iteration, counts items with a status of &quot;Done&quot; as completed and all assigned items as total. The average line shows the mean completed items across all iterations."
        why="Use this to understand your team's delivery capacity over time. A rising trend means the team is increasing throughput. Large gaps between completed and total indicate over-commitment or scope creep."
      />
    </div>
  );
}
