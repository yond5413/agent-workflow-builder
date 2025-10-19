import { Workflow, WorkflowNode, WorkflowEdge, NodeType } from "@/types/workflow";
import { Node, Edge } from "reactflow";

/**
 * Export React Flow state to workflow JSON format
 */
export function exportWorkflow(nodes: Node[], edges: Edge[]): Workflow {
  const workflowNodes: WorkflowNode[] = nodes.map((node) => ({
    id: node.id,
    type: node.type as NodeType,
    data: node.data,
    position: node.position,
  }));

  const workflowEdges: WorkflowEdge[] = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
  }));

  return {
    id: `workflow-${Date.now()}`,
    nodes: workflowNodes,
    edges: workflowEdges,
    metadata: {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };
}

/**
 * Import workflow JSON to React Flow state
 */
export function importWorkflow(workflow: Workflow): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = workflow.nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: node.data,
  }));

  const edges: Edge[] = workflow.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle || null,
    targetHandle: edge.targetHandle || null,
  }));

  return { nodes, edges };
}

/**
 * Download workflow as JSON file
 */
export function downloadJSON(workflow: Workflow, filename: string) {
  const json = JSON.stringify(workflow, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validate imported workflow structure
 */
export function validateImportedWorkflow(data: any): data is Workflow {
  if (!data || typeof data !== "object") return false;
  if (!Array.isArray(data.nodes)) return false;
  if (!Array.isArray(data.edges)) return false;

  // Basic node validation
  for (const node of data.nodes) {
    if (!node.id || !node.type || !node.position) return false;
    if (typeof node.position.x !== "number" || typeof node.position.y !== "number")
      return false;
  }

  // Basic edge validation
  for (const edge of data.edges) {
    if (!edge.id || !edge.source || !edge.target) return false;
  }

  return true;
}

