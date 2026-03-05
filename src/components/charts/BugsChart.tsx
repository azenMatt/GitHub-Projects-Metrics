"use client";

import { BugsWeek } from "@/lib/metrics/bugs";
import { useChartTheme, chartColors } from "@/lib/chartTheme";
import ChartContainer from "./ChartContainer";

interface Props {
  data: BugsWeek[];
}

export default function BugsChart({ data }: Props) {
  const theme = useChartTheme();

  if (data.length === 0) {
    return (
      <p className="text-[var(--text-tertiary)] text-sm">
        No bugs found. Make sure issues have the &quot;Bug&quot; issue type set.
      </p>
    );
  }

  const options: Highcharts.Options = {
    ...theme,
    chart: { ...theme.chart, type: "areaspline" },
    title: { ...theme.title, text: "Bugs Opened vs Closed" },
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
      title: { ...(theme.yAxis as Highcharts.YAxisOptions)?.title, text: "Count" },
      min: 0,
    },
    series: [
      {
        name: "Opened",
        type: "areaspline",
        data: data.map((d) => d.opened),
        color: chartColors.danger,
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, chartColors.danger + "20"],
            [1, chartColors.danger + "00"],
          ],
        },
      },
      {
        name: "Closed",
        type: "areaspline",
        data: data.map((d) => d.closed),
        color: chartColors.success,
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, chartColors.success + "20"],
            [1, chartColors.success + "00"],
          ],
        },
      },
    ],
    ...{ credits: { enabled: false } },
  };

  return <ChartContainer options={options} />;
}
