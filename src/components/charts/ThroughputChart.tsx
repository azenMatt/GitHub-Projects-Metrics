"use client";

import { ThroughputWeek } from "@/lib/metrics/throughput";
import { useChartTheme, chartColors } from "@/lib/chartTheme";
import ChartContainer from "./ChartContainer";

interface Props {
  data: ThroughputWeek[];
}

export default function ThroughputChart({ data }: Props) {
  const theme = useChartTheme();

  if (data.length === 0) {
    return <p className="text-[var(--text-tertiary)] text-sm">No completed items found.</p>;
  }

  const totalCompleted = data.reduce((s, d) => s + d.count, 0);

  const options: Highcharts.Options = {
    ...theme,
    chart: { ...theme.chart, type: "column" },
    title: { ...theme.title, text: "Throughput" },
    subtitle: {
      ...theme.subtitle,
      text: `${totalCompleted} items completed across ${data.length} weeks`,
    },
    xAxis: {
      ...theme.xAxis,
      categories: data.map((d) => d.weekStart),
      labels: {
        ...(theme.xAxis as Highcharts.XAxisOptions)?.labels,
        rotation: -45,
      },
    },
    yAxis: {
      ...theme.yAxis,
      title: { ...(theme.yAxis as Highcharts.YAxisOptions)?.title, text: "Items Completed" },
      min: 0,
    },
    series: [
      {
        name: "Completed",
        type: "column",
        data: data.map((d) => d.count),
        color: chartColors.primary,
      },
      {
        name: "4-week avg",
        type: "spline",
        data: data.map((d) => d.rollingAvg),
        color: chartColors.warning,
        dashStyle: "ShortDash",
        marker: { enabled: false },
        lineWidth: 2,
      },
    ],
    ...{ credits: { enabled: false } },
  };

  return <ChartContainer options={options} />;
}
