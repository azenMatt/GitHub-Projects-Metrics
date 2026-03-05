"use client";

import { BurndownPoint } from "@/lib/metrics/burndown";
import { useChartTheme, chartColors } from "@/lib/chartTheme";
import ChartContainer from "./ChartContainer";

interface Props {
  data: BurndownPoint[];
  iterationTitle: string;
}

export default function BurndownChart({ data, iterationTitle }: Props) {
  const theme = useChartTheme();

  if (data.length === 0) {
    return <p className="text-[var(--text-tertiary)] text-sm">No data for this iteration.</p>;
  }

  const options: Highcharts.Options = {
    ...theme,
    chart: { ...theme.chart, type: "areaspline" },
    title: { ...theme.title, text: `Burndown — ${iterationTitle}` },
    xAxis: {
      ...theme.xAxis,
      categories: data.map((p) => p.date),
      labels: {
        ...(theme.xAxis as Highcharts.XAxisOptions)?.labels,
        rotation: -45,
      },
    },
    yAxis: {
      ...theme.yAxis,
      title: { ...(theme.yAxis as Highcharts.YAxisOptions)?.title, text: "Remaining Items" },
      min: 0,
    },
    series: [
      {
        name: "Remaining",
        type: "areaspline",
        data: data.map((p) => p.remaining),
        color: chartColors.primary,
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, chartColors.primary + "30"],
            [1, chartColors.primary + "00"],
          ],
        },
      },
      {
        name: "Ideal",
        type: "spline",
        data: data.map((p) => p.ideal),
        color: chartColors.idealLine,
        dashStyle: "Dash",
        marker: { enabled: false },
      },
    ],
    ...{ credits: { enabled: false } },
  };

  return <ChartContainer options={options} />;
}
