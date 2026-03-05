"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { computeThroughput } from "@/lib/metrics/throughput";
import ThroughputChart from "@/components/charts/ThroughputChart";
import ReportDescription from "@/components/ReportDescription";

export default function ThroughputPage() {
  const { projectData } = useStore();

  const throughputData = useMemo(() => {
    if (!projectData) return [];
    return computeThroughput(projectData);
  }, [projectData]);

  return (
    <div>
      <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-6">Throughput</h2>
      <ThroughputChart data={throughputData} />
      <ReportDescription
        how="Groups all closed items by the week they were closed, filling in zero for weeks with no completions. The rolling average is calculated over a trailing 4-week window to smooth out spikes."
        why="Use this to measure your team's delivery rate independent of sprint boundaries. A steady or rising rolling average signals healthy, predictable output. Dips may indicate blockers, holidays, or context-switching overhead."
      />
    </div>
  );
}
