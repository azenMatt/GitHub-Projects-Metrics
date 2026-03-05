"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { computeCycleTime, computeCycleTimeStats, getIssueTypes } from "@/lib/metrics/cycleTime";
import CycleTimeChart from "@/components/charts/CycleTimeChart";
import ReportDescription from "@/components/ReportDescription";

export default function CycleTimePage() {
  const { projectData } = useStore();
  const [selectedTypes, setSelectedTypes] = useState<Set<string> | null>(null);

  const allData = useMemo(() => {
    if (!projectData) return [];
    return computeCycleTime(projectData);
  }, [projectData]);

  const issueTypes = useMemo(() => getIssueTypes(allData), [allData]);

  // Default to all selected
  const activeTypes = selectedTypes ?? new Set(issueTypes);

  const filteredData = useMemo(
    () => allData.filter((d) => activeTypes.has(d.issueType ?? "None")),
    [allData, activeTypes]
  );

  const stats = useMemo(
    () => computeCycleTimeStats(filteredData),
    [filteredData]
  );

  const toggleType = (type: string) => {
    const next = new Set(activeTypes);
    if (next.has(type)) {
      next.delete(type);
    } else {
      next.add(type);
    }
    setSelectedTypes(next);
  };

  const allSelected = activeTypes.size === issueTypes.length;
  const toggleAll = () => {
    setSelectedTypes(allSelected ? new Set() : new Set(issueTypes));
  };

  return (
    <div>
      <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Cycle Time</h2>

      {issueTypes.length > 1 && (
        <div className="mb-6">
          <span className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider">
            Issue Types
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={toggleAll}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all duration-150 ${
                allSelected
                  ? "bg-[var(--accent-muted)] border-[var(--accent)] text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--text-tertiary)]"
              }`}
            >
              All
            </button>
            {issueTypes.map((type) => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all duration-150 ${
                  activeTypes.has(type)
                    ? "bg-[var(--accent-muted)] border-[var(--accent)] text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--text-tertiary)]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      <CycleTimeChart data={filteredData} stats={stats} />
      <ReportDescription
        how="Measures the time between issue creation and issue close for each item. Only closed items are included. Use the issue type pills to filter by type."
        why="Use this to identify how long work typically takes to complete. Items above the 85th percentile line are outliers worth investigating. A downward trend indicates improving delivery speed."
      />
    </div>
  );
}
