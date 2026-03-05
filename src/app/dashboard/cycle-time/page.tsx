"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useStore } from "@/lib/store";
import { computeCycleTime, computeCycleTimeStats, getIssueTypes } from "@/lib/metrics/cycleTime";
import { fetchStatusTransitions } from "@/lib/github/client";
import { StatusTransitionMap } from "@/lib/github/types";
import CycleTimeChart from "@/components/charts/CycleTimeChart";
import ReportDescription from "@/components/ReportDescription";

export default function CycleTimePage() {
  const { projectData, token } = useStore();
  const statuses = projectData?.statusOptions ?? [];

  const [startAt, setStartAt] = useState<"created" | string>("created");
  const [selectedTypes, setSelectedTypes] = useState<Set<string> | null>(null);
  const [transitionMap, setTransitionMap] = useState<StatusTransitionMap | null>(null);
  const [loadingTransitions, setLoadingTransitions] = useState(false);

  // Fetch timeline data once when project loads
  const loadTransitions = useCallback(async () => {
    if (!projectData || !token) return;
    setLoadingTransitions(true);
    try {
      const map = await fetchStatusTransitions(token, projectData);
      setTransitionMap(map);
    } catch {
      // Silently fall back — created→closed still works
      setTransitionMap(new Map());
    } finally {
      setLoadingTransitions(false);
    }
  }, [projectData, token]);

  useEffect(() => {
    loadTransitions();
  }, [loadTransitions]);

  const allData = useMemo(() => {
    if (!projectData) return [];
    return computeCycleTime(projectData, {
      startAt,
      transitionMap: transitionMap ?? undefined,
    });
  }, [projectData, startAt, transitionMap]);

  const issueTypes = useMemo(() => getIssueTypes(allData), [allData]);
  const activeTypes = selectedTypes ?? new Set(issueTypes);
  const allTypesSelected = activeTypes.size === issueTypes.length;

  const filteredData = useMemo(
    () => allData.filter((d) => activeTypes.has(d.issueType ?? "None")),
    [allData, activeTypes]
  );

  const stats = useMemo(
    () => computeCycleTimeStats(filteredData),
    [filteredData]
  );

  const toggleType = (type: string) => {
    if (allTypesSelected) {
      setSelectedTypes(new Set([type]));
    } else {
      const next = new Set(activeTypes);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      setSelectedTypes(next);
    }
  };

  const toggleAll = () => {
    setSelectedTypes(allTypesSelected ? new Set() : new Set(issueTypes));
  };

  const startLabel = startAt === "created" ? "Created" : startAt;

  return (
    <div>
      <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Cycle Time</h2>

      {/* Starts at selector */}
      {statuses.length > 0 && (
        <div className="mb-4">
          <span className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider">
            Starts at
            {loadingTransitions && (
              <span className="ml-2 text-[var(--text-tertiary)] normal-case tracking-normal font-normal">
                loading timeline data…
              </span>
            )}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setStartAt("created")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all duration-150 ${
                startAt === "created"
                  ? "bg-[var(--accent-muted)] border-[var(--accent)] text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--text-tertiary)]"
              }`}
            >
              Issue Created
            </button>
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStartAt(s)}
                disabled={loadingTransitions && startAt !== s}
                className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all duration-150 ${
                  startAt === s
                    ? "bg-[var(--accent-muted)] border-[var(--accent)] text-[var(--accent)]"
                    : loadingTransitions
                      ? "border-[var(--border)] text-[var(--text-tertiary)] opacity-30 cursor-not-allowed"
                      : "border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--text-tertiary)]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Issue type filter */}
      {issueTypes.length > 1 && (
        <div className="mb-6">
          <span className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider">
            Issue Types
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={toggleAll}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all duration-150 ${
                allTypesSelected
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

      <CycleTimeChart data={filteredData} stats={stats} startLabel={startLabel} />
      <ReportDescription
        how={`Measures the time between "${startLabel}" and "Issue Closed" for each item. ${startAt !== "created" ? "The start timestamp is based on when the item first moved into the selected status, fetched from the issue timeline." : "Only closed items are included."} Use the issue type pills to filter by type.`}
        why="Use this to identify how long work typically takes to complete. Items above the 85th percentile line are outliers worth investigating. A downward trend indicates improving delivery speed."
      />
    </div>
  );
}
