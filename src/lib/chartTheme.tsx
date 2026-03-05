"use client";

import { useTheme } from "@/lib/theme";
import Highcharts from "highcharts";
import { useMemo } from "react";

export function useChartTheme(): Partial<Highcharts.Options> {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return useMemo(
    () => ({
      chart: {
        backgroundColor: "transparent",
        style: {
          fontFamily:
            'var(--font-geist-sans), "Inter", -apple-system, sans-serif',
        },
        spacing: [20, 20, 20, 20],
      },
      title: {
        style: {
          color: isDark ? "#e5e5e5" : "#171717",
          fontSize: "14px",
          fontWeight: "500",
        },
      },
      subtitle: {
        style: {
          color: isDark ? "#737373" : "#a3a3a3",
          fontSize: "12px",
          fontWeight: "400",
        },
      },
      xAxis: {
        gridLineColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        lineColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
        tickColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
        labels: {
          style: {
            color: isDark ? "#737373" : "#a3a3a3",
            fontSize: "11px",
          },
        },
        title: {
          style: {
            color: isDark ? "#737373" : "#a3a3a3",
            fontSize: "11px",
            fontWeight: "400",
          },
        },
      },
      yAxis: {
        gridLineColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        lineColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
        labels: {
          style: {
            color: isDark ? "#737373" : "#a3a3a3",
            fontSize: "11px",
          },
        },
        title: {
          style: {
            color: isDark ? "#737373" : "#a3a3a3",
            fontSize: "11px",
            fontWeight: "400",
          },
        },
      },
      legend: {
        itemStyle: {
          color: isDark ? "#a3a3a3" : "#525252",
          fontWeight: "400",
          fontSize: "12px",
        },
        itemHoverStyle: {
          color: isDark ? "#e5e5e5" : "#171717",
        },
      },
      tooltip: {
        backgroundColor: isDark ? "#1c1c1c" : "#ffffff",
        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        borderRadius: 8,
        shadow: false,
        style: {
          color: isDark ? "#e5e5e5" : "#171717",
          fontSize: "12px",
        },
      },
      plotOptions: {
        series: {
          animation: { duration: 600, easing: "easeOutQuart" },
        },
        line: {
          lineWidth: 2,
          marker: { radius: 3, lineWidth: 0 },
        },
        scatter: {
          marker: { radius: 4, lineWidth: 0 },
        },
        column: {
          borderRadius: 4,
          borderWidth: 0,
        },
      },
      credits: { enabled: false },
    }),
    [isDark]
  );
}

// Linear-inspired color palette
export const chartColors = {
  primary: "#5E6AD2",     // Linear purple
  secondary: "#6B7280",   // Neutral gray
  success: "#4ADE80",     // Green
  danger: "#F87171",      // Red
  warning: "#FBBF24",     // Yellow
  muted: "rgba(94,106,210,0.2)",
  idealLine: "#525252",
};
