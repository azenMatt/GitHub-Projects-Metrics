"use client";

import { VelocityBar } from "@/lib/metrics/velocity";
import { useChartTheme, chartColors } from "@/lib/chartTheme";
import ChartContainer from "./ChartContainer";

interface Props {
  data: VelocityBar[];
}

export default function VelocityChart({ data }: Props) {
  const theme = useChartTheme();

  if (data.length === 0) {
    return <p className="text-[var(--text-tertiary)] text-sm">No iterations found.</p>;
  }

  const avg =
    data.length > 0
      ? Math.round(
          (data.reduce((s, d) => s + d.completed, 0) / data.length) * 10
        ) / 10
      : 0;

  const options: Highcharts.Options = {
    ...theme,
    chart: { ...theme.chart, type: "column" },
    title: { ...theme.title, text: "Velocity" },
    subtitle: { ...theme.subtitle, text: `Average: ${avg} items per iteration` },
    xAxis: {
      ...theme.xAxis,
      categories: data.map((d) => d.iteration),
    },
    yAxis: {
      ...theme.yAxis,
      title: { ...(theme.yAxis as Highcharts.YAxisOptions)?.title, text: "Items" },
      min: 0,
    },
    series: [
      {
        name: "Completed",
        type: "column",
        data: data.map((d) => d.completed),
        color: chartColors.primary,
      },
      {
        name: "Total Assigned",
        type: "column",
        data: data.map((d) => d.total),
        color: chartColors.secondary + "40",
      },
      {
        name: `Average (${avg})`,
        type: "spline",
        data: data.map(() => avg),
        color: chartColors.warning,
        dashStyle: "Dash",
        marker: { enabled: false },
        lineWidth: 1.5,
      },
    ],
    ...{ credits: { enabled: false } },
  };

  return <ChartContainer options={options} />;
}
