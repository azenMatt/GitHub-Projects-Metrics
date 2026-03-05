"use client";

import { HierarchyNode, HierarchyProgress } from "@/lib/github/types";

interface Props {
  node: HierarchyNode;
}

function collectProgress(node: HierarchyNode): HierarchyProgress {
  const acc = { done: 0, inProgress: 0, notStarted: 0, total: 0 };
  const walk = (n: HierarchyNode) => {
    if (n.children.length === 0) {
      acc.total++;
      if (n.closedAt) acc.done++;
      else if (n.status) acc.inProgress++;
      else acc.notStarted++;
    } else {
      for (const child of n.children) walk(child);
    }
  };
  for (const child of node.children) walk(child);
  return acc;
}

export default function InitiativeProgressBar({ node }: Props) {
  const progress = collectProgress(node);
  const { done, inProgress, notStarted, total } = progress;
  if (total === 0) return null;

  const pctDone = (done / total) * 100;
  const pctInProgress = (inProgress / total) * 100;
  const pctNotStarted = (notStarted / total) * 100;
  const overallPct = Math.round(pctDone);

  return (
    <div
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border)",
        borderRadius: "10px 10px 0 0",
        borderBottom: "none",
        padding: "14px 20px 12px",
      }}
    >
      {/* Title row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
            {node.title}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
            #{node.number}
          </span>
        </div>
        <span style={{ fontSize: 20, fontWeight: 700, color: "#8957e5", letterSpacing: "-0.02em" }}>
          {overallPct}%
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          display: "flex",
          height: 10,
          borderRadius: 5,
          overflow: "hidden",
          background: "var(--hover-bg, #e5e7eb)",
        }}
      >
        {pctDone > 0 && (
          <div
            style={{
              width: `${pctDone}%`,
              background: "linear-gradient(90deg, #8957e5, #a371f7)",
              transition: "width 0.5s ease",
            }}
          />
        )}
        {pctInProgress > 0 && (
          <div
            style={{
              width: `${pctInProgress}%`,
              background: "linear-gradient(90deg, #2ea043, #3fb950)",
              transition: "width 0.5s ease",
            }}
          />
        )}
        {pctNotStarted > 0 && (
          <div
            style={{
              width: `${pctNotStarted}%`,
              transition: "width 0.5s ease",
            }}
          />
        )}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 11, color: "var(--text-tertiary)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#8957e5", display: "inline-block" }} />
          {done} done
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2ea043", display: "inline-block" }} />
          {inProgress} in progress
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--hover-bg, #d1d5db)", display: "inline-block" }} />
          {notStarted} not started
        </span>
        <span style={{ marginLeft: "auto", color: "var(--text-tertiary)" }}>
          {total} total
        </span>
      </div>
    </div>
  );
}
