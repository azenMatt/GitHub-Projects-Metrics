"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import InitiativeNodeComponent from "./InitiativeNode";
import { HierarchyNode } from "@/lib/github/types";
import { buildFlowLayout } from "@/lib/metrics/initiative";
import { ToggleContext } from "./InitiativeToggleContext";

interface Props {
  hierarchy: HierarchyNode[];
}

const nodeTypes: NodeTypes = {
  initiativeNode: InitiativeNodeComponent,
};

function collectAllIds(nodes: HierarchyNode[]): Set<string> {
  const ids = new Set<string>();
  const walk = (list: HierarchyNode[]) => {
    for (const n of list) {
      if (n.children.length > 0) {
        ids.add(n.id);
        walk(n.children);
      }
    }
  };
  walk(nodes);
  return ids;
}

function FlowInner({ hierarchy }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => collectAllIds(hierarchy));
  const { fitView } = useReactFlow();

  // Reset to fully expanded when the selected tree changes
  useEffect(() => {
    setExpandedIds(collectAllIds(hierarchy));
  }, [hierarchy]);

  const handleToggle = useCallback((nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const layout = useMemo(
    () => buildFlowLayout(hierarchy, expandedIds),
    [hierarchy, expandedIds]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layout.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layout.edges);

  // Sync layout changes (expand/collapse) into draggable state
  useEffect(() => {
    setNodes(layout.nodes);
    setEdges(layout.edges);
  }, [layout, setNodes, setEdges]);

  // Re-fit view when layout changes
  useEffect(() => {
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
  }, [layout, fitView]);

  return (
    <ToggleContext.Provider value={handleToggle}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background color="var(--border)" gap={20} size={1} />
        <Controls
          showInteractive={false}
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            borderRadius: 6,
          }}
        />
      </ReactFlow>
    </ToggleContext.Provider>
  );
}

export default function InitiativeFlowChart({ hierarchy }: Props) {
  return (
    <div style={{ width: "100%", height: "600px", borderRadius: "0 0 8px 8px", overflow: "hidden", border: "1px solid var(--border)" }}>
      <ReactFlowProvider>
        <FlowInner hierarchy={hierarchy} />
      </ReactFlowProvider>
    </div>
  );
}
