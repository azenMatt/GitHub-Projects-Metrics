import { HierarchyNode } from "../github/types";
import { type Node, type Edge } from "@xyflow/react";

export interface FlowLayout {
  nodes: Node[];
  edges: Edge[];
}

const NODE_WIDTH = 320;
const NODE_HEIGHT = 100;
const HORIZONTAL_GAP = 80;
const VERTICAL_GAP = 20;

interface LayoutResult {
  nodes: Node[];
  edges: Edge[];
  totalHeight: number;
}

function layoutSubtree(
  node: HierarchyNode,
  x: number,
  y: number,
  expandedIds: Set<string>,
  parentId?: string
): LayoutResult {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const isExpanded = expandedIds.has(node.id);

  const flowNode: Node = {
    id: node.id,
    type: "initiativeNode",
    position: { x, y },
    data: {
      title: node.title,
      number: node.number,
      url: node.url,
      issueType: node.issueType,
      status: node.status,
      closedAt: node.closedAt,
      progress: node.progress,
      hasChildren: node.hasChildren,
      isExpanded,
      childCount: node.children.length,
    },
  };
  nodes.push(flowNode);

  if (parentId) {
    edges.push({
      id: `${parentId}-${node.id}`,
      source: parentId,
      target: node.id,
      type: "smoothstep",
      style: { stroke: "var(--border)", strokeWidth: 1.5 },
    });
  }

  let totalHeight = NODE_HEIGHT;

  if (isExpanded && node.children.length > 0) {
    const childX = x + NODE_WIDTH + HORIZONTAL_GAP;
    let childY = y;

    for (const child of node.children) {
      const childResult = layoutSubtree(child, childX, childY, expandedIds, node.id);
      nodes.push(...childResult.nodes);
      edges.push(...childResult.edges);
      childY += childResult.totalHeight + VERTICAL_GAP;
    }

    const childrenHeight = childY - y - VERTICAL_GAP;
    totalHeight = Math.max(NODE_HEIGHT, childrenHeight);
  }

  return { nodes, edges, totalHeight };
}

export function buildFlowLayout(
  roots: HierarchyNode[],
  expandedIds: Set<string>
): FlowLayout {
  const allNodes: Node[] = [];
  const allEdges: Edge[] = [];
  let currentY = 0;

  for (const root of roots) {
    const result = layoutSubtree(root, 0, currentY, expandedIds);
    allNodes.push(...result.nodes);
    allEdges.push(...result.edges);
    currentY += result.totalHeight + VERTICAL_GAP * 2;
  }

  return { nodes: allNodes, edges: allEdges };
}
