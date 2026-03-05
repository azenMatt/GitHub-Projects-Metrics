"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { computeAgingWip, getDefaultWipStatuses } from "@/lib/metrics/agingWip";
import AgingWipChart from "@/components/charts/AgingWipChart";
import ReportDescription from "@/components/ReportDescription";

export default function AgingWipPage() {
  const { projectData } = useStore();

  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(() => {
    const opts = projectData?.statusOptions ?? [];
    return new Set(getDefaultWipStatuses(opts));
  });

  const allStatuses = projectData?.statusOptions ?? [];

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  };

  const wipData = useMemo(() => {
    if (!projectData) return [];
    return computeAgingWip(projectData, Array.from(selectedStatuses));
  }, [projectData, selectedStatuses]);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <h2 className="text-sm font-medium text-[var(--text-secondary)]">Aging Work In Progress</h2>
        <div className="flex items-center gap-1.5 flex-wrap">
          {allStatuses.map((status) => {
            const active = selectedStatuses.has(status);
            return (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all duration-150 ${
                  active
                    ? "bg-[var(--accent-muted)] border-[var(--accent)] text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--text-tertiary)]"
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>
      <AgingWipChart data={wipData} />
      <ReportDescription
        how="Filters items whose current status matches the selected statuses above, excludes anything already closed, and calculates age as the number of days since the item was created. Items are sorted oldest-first and color-coded: green under 7 days, yellow under 14 days, red at 14 days or more."
        why="Use this to spot stale work before it becomes a problem. Items that have been in progress for weeks are often blocked, forgotten, or too large. This report makes them visible so the team can take action — unblock, split, or reprioritize."
      />
    </div>
  );
}
