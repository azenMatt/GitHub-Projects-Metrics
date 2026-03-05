"use client";

import { CfdSeries } from "@/lib/metrics/cumulativeFlow";
import { useChartTheme } from "@/lib/chartTheme";
import ChartContainer from "./ChartContainer";

interface Props {
  data: CfdSeries;
}

// Distinct palette for stacked areas
const STATUS_COLORS: Record<string, string> = {
  Done: "#10b981",
  "In Progress": "#3b82f6",
  "In Review": "#f59e0b",
  Todo: "#8b5cf6",
  Backlog: "#6b7280",
};

function getStatusColor(status: string, index: number): string {
  if (STATUS_COLORS[status]) return STATUS_COLORS[status];
  const fallback = ["#ef4444", "#06b6d4", "#ec4899", "#14b8a6", "#f97316"];
  return fallback[index % fallback.length];
}

export default function CfdChart({ data }: Props) {
  const theme = useChartTheme();

  if (data.labels.length === 0) {
    return <p className="text-[var(--text-tertiary)] text-sm">No data available.</p>;
  }

  // Reverse status order so "Done" is at the bottom (most stable band)
  const orderedStatuses = [...data.statuses].reverse();

  const options: Highcharts.Options = {
    ...theme,
    chart: { ...theme.chart, type: "area" },
    title: { ...theme.title, text: "Cumulative Flow" },
    xAxis: {
      ...theme.xAxis,
      categories: data.labels,
      labels: {
        ...(theme.xAxis as Highcharts.XAxisOptions)?.labels,
        rotation: -45,
      },
    },
    yAxis: {
      ...theme.yAxis,
      title: { ...(theme.yAxis as Highcharts.YAxisOptions)?.title, text: "Items" },
      min: 0,
    },
    plotOptions: {
      ...theme.plotOptions,
      area: {
        stacking: "normal",
        lineWidth: 1.5,
        marker: { enabled: false },
        fillOpacity: 0.4,
      },
    },
    series: orderedStatuses.map((status, i) => ({
      name: status,
      type: "area" as const,
      data: data.data[status] ?? [],
      color: getStatusColor(status, i),
    })),
    ...{ credits: { enabled: false } },
  };

  return <ChartContainer options={options} />;
}
