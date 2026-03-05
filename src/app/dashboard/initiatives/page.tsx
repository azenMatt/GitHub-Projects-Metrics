"use client";

import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/lib/store";
import { fetchInitiativeHierarchy } from "@/lib/github/client";
import { HierarchyNode } from "@/lib/github/types";
import InitiativeFlowChart from "@/components/charts/InitiativeFlowChart";
import InitiativeProgressBar from "@/components/charts/InitiativeProgressBar";
import ReportDescription from "@/components/ReportDescription";

export default function InitiativesPage() {
  const { projectData, token } = useStore();
  const [hierarchy, setHierarchy] = useState<HierarchyNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHierarchy = useCallback(async () => {
    if (!projectData || !token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchInitiativeHierarchy(token, projectData);
      setHierarchy(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [projectData, token]);

  useEffect(() => {
    loadHierarchy();
  }, [loadHierarchy]);

  const selectedTree = hierarchy.find((n) => n.id === selectedId) ?? null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-sm font-medium text-[var(--text-secondary)]">
          Initiative Report
        </h2>
        {loading && (
          <span className="text-xs text-[var(--text-tertiary)]">
            Loading hierarchy…
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
          {error}
        </div>
      )}

      {!loading && hierarchy.length === 0 && !error && (
        <div className="p-8 text-center text-[var(--text-tertiary)] text-sm">
          No initiatives or epics found in this project. This report
          requires issues with the &ldquo;Initiative&rdquo; or &ldquo;Epic&rdquo; issue type.
        </div>
      )}

      {hierarchy.length > 0 && (
        <>
          <div className="mb-4">
            <select
              value={selectedId ?? ""}
              onChange={(e) => setSelectedId(e.target.value || null)}
              className="text-sm px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-primary)] cursor-pointer"
            >
              <option value="">Select initiative or epic…</option>
              {hierarchy.map((node) => (
                <option key={node.id} value={node.id}>
                  [{node.issueType ?? "Unknown"}] #{node.number} — {node.title}
                </option>
              ))}
            </select>
          </div>

          {selectedTree && (
            <>
              <InitiativeProgressBar node={selectedTree} />
              <InitiativeFlowChart hierarchy={[selectedTree]} />
            </>
          )}
        </>
      )}

      <ReportDescription
        how="Fetches all initiatives and epics from the project, then recursively loads their sub-issues to build a hierarchy tree. Each node shows the progress of its direct children: how many are done, in progress, or not started. Click the + button on a node to expand and see its children."
        why="Use this to get a visual overview of initiative or epic progress across your project. It helps identify which large efforts are on track, which are blocked, and where work is concentrated. The hierarchical view shows the relationship between strategic initiatives and the tactical work underneath."
      />
    </div>
  );
}
