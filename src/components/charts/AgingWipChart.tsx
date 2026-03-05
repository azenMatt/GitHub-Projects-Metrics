"use client";

import { AgingWipItem, getAgeSeverity } from "@/lib/metrics/agingWip";
import { useChartTheme } from "@/lib/chartTheme";
import ChartContainer from "./ChartContainer";

interface Props {
  data: AgingWipItem[];
}

const severityColors = {
  green: "#4ADE80",
  yellow: "#FBBF24",
  red: "#F87171",
};

export default function AgingWipChart({ data }: Props) {
  const theme = useChartTheme();

  if (data.length === 0) {
    return (
      <p className="text-[var(--text-tertiary)] text-sm">
        No items currently in progress.
      </p>
    );
  }

  const options: Highcharts.Options = {
    ...theme,
    chart: { ...theme.chart, type: "bar", height: Math.max(400, data.length * 28 + 100) },
    title: { ...theme.title, text: "Aging Work In Progress" },
    subtitle: {
      ...theme.subtitle,
      text: `${data.length} items in progress`,
    },
    xAxis: {
      ...theme.xAxis,
      categories: data.map((d) =>
        d.number ? `#${d.number} ${d.title}` : d.title
      ),
      labels: {
        ...(theme.xAxis as Highcharts.XAxisOptions)?.labels,
        style: {
          ...(theme.xAxis as Highcharts.XAxisOptions)?.labels?.style,
          width: 200,
          textOverflow: "ellipsis",
        },
      },
    },
    yAxis: {
      ...theme.yAxis,
      title: { ...(theme.yAxis as Highcharts.YAxisOptions)?.title, text: "Age (days)" },
      min: 0,
      plotBands: [
        {
          from: 0,
          to: 7,
          color: "rgba(74, 222, 128, 0.04)",
          label: { text: "< 7d", style: { color: severityColors.green, fontSize: "10px" } },
        },
        {
          from: 7,
          to: 14,
          color: "rgba(251, 191, 36, 0.04)",
          label: { text: "7-14d", style: { color: severityColors.yellow, fontSize: "10px" } },
        },
        {
          from: 14,
          to: Math.max(30, ...data.map((d) => d.ageDays)) + 5,
          color: "rgba(248, 113, 113, 0.04)",
          label: { text: "> 14d", style: { color: severityColors.red, fontSize: "10px" } },
        },
      ],
    },
    series: [
      {
        name: "Age",
        type: "bar",
        data: data.map((d) => ({
          y: d.ageDays,
          color: severityColors[getAgeSeverity(d.ageDays)],
        })),
        borderRadius: 3,
      },
    ],
    legend: { enabled: false },
    tooltip: {
      ...theme.tooltip,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: function (this: any) {
        const point = this.point;
        const item = data[point.index];
        return `<b>${item.number ? "#" + item.number + " " : ""}${item.title}</b><br/>` +
          `Status: ${item.status}<br/>` +
          `Age: <b>${item.ageDays} days</b>`;
      },
    },
    ...{ credits: { enabled: false } },
  };

  return <ChartContainer options={options} />;
}
