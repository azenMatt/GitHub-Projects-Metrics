"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { computeCycleTime, computeCycleTimeStats } from "@/lib/metrics/cycleTime";
import CycleTimeChart from "@/components/charts/CycleTimeChart";
import ReportDescription from "@/components/ReportDescription";

export default function CycleTimePage() {
  const { projectData } = useStore();
  const statuses = projectData?.statusOptions ?? [];

  const [startAt, setStartAt] = useState<"created" | string>("created");
  const [endAt, setEndAt] = useState<"closed" | string>("closed");

  // Determine which end statuses are at or before the start status
  const startIdx = startAt === "created" ? -1 : statuses.indexOf(startAt);

  function isEndDisabled(status: string): boolean {
    if (startAt === "created") return false;
    const idx = statuses.indexOf(status);
    if (idx === -1 || startIdx === -1) return false;
    return idx <= startIdx;
  }

  // Reset endAt if it becomes invalid after a start change
  const handleStartChange = (value: string) => {
    setStartAt(value);
    if (value !== "created" && endAt !== "closed") {
      const newStartIdx = statuses.indexOf(value);
      const endIdx = statuses.indexOf(endAt);
      if (newStartIdx !== -1 && endIdx !== -1 && endIdx <= newStartIdx) {
        setEndAt("closed");
      }
    }
  };

  const cycleTimeData = useMemo(() => {
    if (!projectData) return [];
    return computeCycleTime(projectData, {
      startAt,
      endAt,
      statusOrder: statuses,
    });
  }, [projectData, startAt, endAt, statuses]);

  const stats = useMemo(
    () => computeCycleTimeStats(cycleTimeData),
    [cycleTimeData]
  );

  const startLabel = startAt === "created" ? "Issue Opened" : startAt;
  const endLabel = endAt === "closed" ? "Issue Closed" : endAt;

  return (
    <div>
      <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Cycle Time</h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div>
          <span className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider">
            Starts at
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <PillButton
              label="Issue Opened"
              active={startAt === "created"}
              onClick={() => handleStartChange("created")}
            />
            {statuses.map((s) => (
              <PillButton
                key={s}
                label={s}
                active={startAt === s}
                onClick={() => handleStartChange(s)}
              />
            ))}
          </div>
        </div>
        <div>
          <span className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider">
            Ends at
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <PillButton
              label="Issue Closed"
              active={endAt === "closed"}
              onClick={() => setEndAt("closed")}
            />
            {statuses.map((s) => (
              <PillButton
                key={s}
                label={s}
                active={endAt === s}
                disabled={isEndDisabled(s)}
                onClick={() => setEndAt(s)}
              />
            ))}
          </div>
        </div>
      </div>

      <CycleTimeChart data={cycleTimeData} stats={stats} startLabel={startLabel} endLabel={endLabel} />
      <ReportDescription
        how={`Measures the time between "${startLabel}" and "${endLabel}" for each qualifying item. Items are filtered to those that have reached at least the start status and the end status based on the order of your project's columns.${startAt !== "created" ? " Note: the start timestamp still uses when the issue was created — the GitHub API does not expose when an item moved to a specific status." : ""}`}
        why="Use this to identify how long work typically takes to complete. Items above the 85th percentile line are outliers worth investigating. A downward trend indicates improving delivery speed."
      />
    </div>
  );
}

function PillButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all duration-150 ${
        active
          ? "bg-[var(--accent-muted)] border-[var(--accent)] text-[var(--accent)]"
          : disabled
            ? "border-[var(--border)] text-[var(--text-tertiary)] opacity-30 cursor-not-allowed"
            : "border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--text-tertiary)]"
      }`}
    >
      {label}
    </button>
  );
}
