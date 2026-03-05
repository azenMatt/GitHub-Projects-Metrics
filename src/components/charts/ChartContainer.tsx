"use client";

import { useRef } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { jsPDF } from "jspdf";

interface Props {
  options: Highcharts.Options;
}

function getChartTitle(chart: Highcharts.Chart): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((chart.title as any)?.textStr as string)?.replace(/[^a-zA-Z0-9 ]/g, "_") || "chart";
}

function buildCSV(chart: Highcharts.Chart): string {
  const categories = chart.xAxis[0]?.categories;
  const isDatetime = chart.xAxis[0]?.options?.type === "datetime";
  const header = ["Category", ...chart.series.map((s) => s.name)];
  const maxLen = Math.max(...chart.series.map((s) => s.data.length));
  const rows: string[][] = [header];

  for (let i = 0; i < maxLen; i++) {
    const row: string[] = [];
    if (categories && categories.length > i) {
      row.push(categories[i]);
    } else if (isDatetime && chart.series[0]?.data[i]?.x) {
      row.push(new Date(chart.series[0].data[i].x as number).toISOString().split("T")[0]);
    } else {
      row.push(String(i));
    }
    for (const series of chart.series) {
      const point = series.data[i];
      row.push(point ? String(point.y ?? "") : "");
    }
    rows.push(row);
  }

  return rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ChartContainer({ options }: Props) {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const handleExportCSV = () => {
    const chart = chartRef.current?.chart;
    if (!chart) return;
    const csv = buildCSV(chart);
    downloadBlob(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      `${getChartTitle(chart)}.csv`,
    );
  };

  const handleExportPDF = () => {
    const chart = chartRef.current?.chart;
    if (!chart) return;
    const svgEl = chart.container.querySelector("svg");
    if (!svgEl) return;

    const { width, height } = svgEl.getBoundingClientRect();
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const orientation = width > height ? "landscape" : "portrait";
      const pdf = new jsPDF({ orientation, unit: "px", format: [width, height] });
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, width, height);
      pdf.save(`${getChartTitle(chart)}.pdf`);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1">
      <div className="flex justify-end gap-1.5 px-3 pt-2">
        <button
          onClick={handleExportCSV}
          className="px-2 py-0.5 text-[11px] font-medium rounded-md
                     text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]
                     border border-[var(--border)] hover:border-[var(--border)]
                     hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
        >
          CSV
        </button>
        <button
          onClick={handleExportPDF}
          className="px-2 py-0.5 text-[11px] font-medium rounded-md
                     text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]
                     border border-[var(--border)] hover:border-[var(--border)]
                     hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
        >
          PDF
        </button>
      </div>
      <HighchartsReact ref={chartRef} highcharts={Highcharts} options={options} />
    </div>
  );
}
