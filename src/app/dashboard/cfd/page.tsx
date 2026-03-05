"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { computeCfdByIteration, computeCfdByWeek, CfdSeries } from "@/lib/metrics/cumulativeFlow";
import CfdChart from "@/components/charts/CfdChart";
import ReportDescription from "@/components/ReportDescription";

type CfdMode = "iteration" | "week";
type TimeRange = "1m" | "6m" | "1y" | "custom";

function dateNMonthsAgo(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 10);
}

function filterSeriesByDateRange(
  series: CfdSeries,
  startDate: string | null,
  endDate: string | null
): CfdSeries {
  if (!startDate && !endDate) return series;
  if (series.labels.length === 0) return series;

  let startIdx = 0;
  let endIdx = series.labels.length - 1;

  if (startDate) {
    const idx = series.labels.findIndex((l) => l >= startDate);
    if (idx !== -1) startIdx = idx;
  }
  if (endDate) {
    for (let i = series.labels.length - 1; i >= 0; i--) {
      if (series.labels[i] <= endDate) { endIdx = i; break; }
    }
  }

  if (startIdx > endIdx) return { labels: [], statuses: series.statuses, data: {} };

  const labels = series.labels.slice(startIdx, endIdx + 1);
  const data: Record<string, number[]> = {};
  for (const status of series.statuses) {
    data[status] = (series.data[status] ?? []).slice(startIdx, endIdx + 1);
  }
  return { labels, statuses: series.statuses, data };
}

export default function CfdPage() {
  const { projectData } = useStore();
  const [mode, setMode] = useState<CfdMode>("week");
  const [timeRange, setTimeRange] = useState<TimeRange>("6m");
  const [startDate, setStartDate] = useState<string | null>(dateNMonthsAgo(6));
  const [endDate, setEndDate] = useState<string | null>(null);

  const fullCfdData = useMemo(() => {
    if (!projectData) return { labels: [], statuses: [], data: {} };
    return mode === "iteration"
      ? computeCfdByIteration(projectData)
      : computeCfdByWeek(projectData);
  }, [projectData, mode]);

  const cfdData = useMemo(
    () => mode === "week" ? filterSeriesByDateRange(fullCfdData, startDate, endDate) : fullCfdData,
    [fullCfdData, mode, startDate, endDate]
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <h2 className="text-sm font-medium text-[var(--text-secondary)]">Cumulative Flow</h2>
        <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
          <button
            onClick={() => setMode("iteration")}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              mode === "iteration"
                ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            By Iteration
          </button>
          <button
            onClick={() => setMode("week")}
            className={`px-3 py-1 text-xs font-medium border-l border-[var(--border)] transition-colors ${
              mode === "week"
                ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            By Week
          </button>
        </div>
        {mode === "week" && (
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
              {([["1m", "1M"], ["6m", "6M"], ["1y", "1Y"]] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setTimeRange(key);
                    setStartDate(dateNMonthsAgo(key === "1m" ? 1 : key === "6m" ? 6 : 12));
                    setEndDate(null);
                  }}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    timeRange === key
                      ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                      : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                  } ${key !== "1m" ? "border-l border-[var(--border)]" : ""}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="text-xs text-[var(--text-tertiary)]">From</label>
            <input
              type="date"
              value={startDate ?? ""}
              onChange={(e) => { setStartDate(e.target.value || null); setTimeRange("custom"); }}
              className="px-2 py-1 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
            />
            <label className="text-xs text-[var(--text-tertiary)]">To</label>
            <input
              type="date"
              value={endDate ?? ""}
              onChange={(e) => { setEndDate(e.target.value || null); setTimeRange("custom"); }}
              className="px-2 py-1 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
            />
          </div>
        )}
      </div>
      <CfdChart data={cfdData} />
      <ReportDescription
        how={`Counts items in each project status and stacks them over time. In "By Iteration" mode, each column is an iteration. In "By Week" mode, items are bucketed by week — closed items count as "Done" from their closed date onward, and open items use their current status. Use the date picker to focus on a specific time range.`}
        why="Use this to visualize how work flows through your process. Widening bands indicate growing work-in-progress, which often leads to slower delivery. Ideally, the Done band grows steadily while in-progress bands stay thin and consistent."
      />
    </div>
  );
}
