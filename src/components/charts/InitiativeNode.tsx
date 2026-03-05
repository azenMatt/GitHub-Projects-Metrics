"use client";

import { memo, useContext } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { HierarchyProgress } from "@/lib/github/types";
import { ToggleContext } from "./InitiativeToggleContext";

interface InitiativeNodeData {
  title: string;
  number: number;
  url: string;
  issueType: string | null;
  status: string | null;
  closedAt: string | null;
  progress: HierarchyProgress;
  hasChildren: boolean;
  isExpanded: boolean;
  childCount: number;
  [key: string]: unknown;
}

const TYPE_COLORS: Record<string, string> = {
  initiative: "#8b5cf6",
  epic: "#3b82f6",
  story: "#10b981",
  task: "#f59e0b",
  bug: "#ef4444",
};

function InitiativeNodeComponent({ id, data }: NodeProps) {
  const d = data as unknown as InitiativeNodeData;
  const onToggle = useContext(ToggleContext);
  const typeColor = TYPE_COLORS[(d.issueType ?? "").toLowerCase()] ?? "var(--text-tertiary)";
  const { progress } = d;
  const total = progress.total || 0;

  const isDone = !!d.closedAt;
  const isInProgress = !isDone && !!d.status;
  const statusLabel = isDone ? "Done" : d.status ?? "No status";
  const borderColor = isDone ? "#8957e5" : isInProgress ? "#2ea043" : "var(--border, #e5e7eb)";

  return (
    <div
      style={{
        background: "var(--card-bg, #fff)",
        border: `2px solid ${borderColor}`,
        borderRadius: 10,
        padding: "10px 14px",
        width: 320,
        fontFamily: "var(--font-sans, system-ui)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        position: "relative",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: "var(--border)" }} />
      <Handle type="source" position={Position.Right} style={{ background: "var(--border)" }} />

      {/* Header: type badge + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        {d.issueType && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#fff",
              background: typeColor,
              borderRadius: 4,
              padding: "1px 6px",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
              flexShrink: 0,
            }}
          >
            {d.issueType}
          </span>
        )}
        <span
          style={{
            fontSize: 11,
            color: "var(--text-tertiary)",
            flexShrink: 0,
          }}
        >
          #{d.number}
        </span>
        <span
          style={{
            fontSize: 10,
            color: isDone ? "#8957e5" : isInProgress ? "#2ea043" : "var(--text-secondary)",
            background: isDone ? "rgba(137,87,229,0.1)" : isInProgress ? "rgba(46,160,67,0.1)" : "var(--hover-bg, #f3f4f6)",
            borderRadius: 4,
            padding: "1px 6px",
            fontWeight: 500,
            flexShrink: 0,
            marginLeft: "auto",
          }}
        >
          {statusLabel}
        </span>
      </div>

      {/* Title */}
      <a
        href={d.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-primary)",
          textDecoration: "none",
          display: "block",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          marginBottom: total > 0 ? 8 : 0,
        }}
        title={d.title}
      >
        {d.title}
      </a>

      {/* Progress bar + counts */}
      {total > 0 && (
        <>
          <div
            style={{
              display: "flex",
              height: 6,
              borderRadius: 3,
              overflow: "hidden",
              background: "var(--hover-bg, #e5e7eb)",
              marginBottom: 4,
            }}
          >
            {progress.done > 0 && (
              <div
                style={{
                  width: `${(progress.done / total) * 100}%`,
                  background: "#8957e5",
                  transition: "width 0.3s ease",
                }}
              />
            )}
            {progress.inProgress > 0 && (
              <div
                style={{
                  width: `${(progress.inProgress / total) * 100}%`,
                  background: "#2ea043",
                  transition: "width 0.3s ease",
                }}
              />
            )}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-tertiary)", display: "flex", gap: 4, flexWrap: "wrap" }}>
            {progress.done > 0 && <span style={{ color: "#8957e5" }}>{progress.done} done</span>}
            {progress.done > 0 && (progress.inProgress > 0 || progress.notStarted > 0) && <span>·</span>}
            {progress.inProgress > 0 && <span style={{ color: "#2ea043" }}>{progress.inProgress} in progress</span>}
            {progress.inProgress > 0 && progress.notStarted > 0 && <span>·</span>}
            {progress.notStarted > 0 && <span>{progress.notStarted} not started</span>}
          </div>
        </>
      )}

      {/* Expand/collapse toggle */}
      {d.hasChildren && (
        <button
          className="nopan nodrag"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(id);
          }}
          style={{
            position: "absolute",
            right: -12,
            top: "50%",
            transform: "translateY(-50%)",
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: "1px solid var(--border)",
            background: "var(--card-bg, #fff)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: "var(--text-secondary)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
            zIndex: 10,
            padding: 0,
          }}
          title={d.isExpanded ? "Collapse" : "Expand"}
        >
          {d.isExpanded ? "−" : "+"}
        </button>
      )}
    </div>
  );
}

export default memo(InitiativeNodeComponent);
