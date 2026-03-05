"use client";

import { CycleTimeItem } from "@/lib/metrics/cycleTime";
import { useChartTheme, chartColors } from "@/lib/chartTheme";
import ChartContainer from "./ChartContainer";

interface Props {
  data: CycleTimeItem[];
  stats: { avg: number; median: number; p85: number };
}

export default function CycleTimeChart({ data, stats }: Props) {
  const theme = useChartTheme();

  if (data.length === 0) {
    return <p className="text-[var(--text-tertiary)] text-sm">No matching items found.</p>;
  }

  const options: Highcharts.Options = {
    ...theme,
    chart: { ...theme.chart, type: "scatter" },
    title: { ...theme.title, text: "Cycle Time" },
    subtitle: {
      ...theme.subtitle,
      text: `Avg: ${stats.avg}d · Median: ${stats.median}d · 85th %ile: ${stats.p85}d`,
    },
    xAxis: {
      ...theme.xAxis,
      type: "datetime",
    },
    yAxis: {
      ...theme.yAxis,
      title: { ...(theme.yAxis as Highcharts.YAxisOptions)?.title, text: "Cycle Time (days)" },
      min: 0,
      plotLines: [
        {
          value: stats.avg,
          color: chartColors.warning,
          dashStyle: "Dash",
          width: 1.5,
          label: {
            text: `Avg (${stats.avg}d)`,
            align: "right",
            style: { color: chartColors.warning, fontSize: "11px" },
          },
        },
        {
          value: stats.p85,
          color: chartColors.danger,
          dashStyle: "Dash",
          width: 1.5,
          label: {
            text: `85th (${stats.p85}d)`,
            align: "right",
            style: { color: chartColors.danger, fontSize: "11px" },
          },
        },
      ],
    },
    plotOptions: {
      scatter: {
        cursor: "pointer",
        point: {
          events: {
            click: function () {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const url = (this as any).url;
              if (url) window.open(url, "_blank", "noopener");
            },
          },
        },
      },
    },
    series: [
      {
        name: "Cycle Time",
        type: "scatter",
        data: data.map((d) => ({
          x: new Date(d.endDate).getTime(),
          y: d.cycleDays,
          name: d.title,
          url: d.url,
          startDate: d.startDate,
          endDate: d.endDate,
        })),
        color: chartColors.primary,
        marker: { radius: 5, symbol: "circle" },
        tooltip: {
          pointFormatter: function () {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const p = this as any;
            const fmtDate = (iso: string) => {
              const d = new Date(iso);
              return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            };
            return `<b>${p.name}</b><br/>` +
              `Created: ${fmtDate(p.startDate)}<br/>` +
              `Closed: ${fmtDate(p.endDate)}<br/>` +
              `Cycle time: <b>${p.y} days</b><br/>` +
              `<span style="color:var(--text-tertiary);font-size:10px">Click to open issue</span>`;
          },
        },
      },
    ],
    ...{ credits: { enabled: false } },
  };

  return <ChartContainer options={options} />;
}
