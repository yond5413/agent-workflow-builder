import {
  Workflow,
  ValidationResult,
  ValidationError,
  NodeType,
  WorkflowNode,
  WorkflowEdge,
  LLMTaskNodeData,
  WebScraperNodeData,
  StructuredOutputNodeData,
  EmbeddingGeneratorNodeData,
  SimilaritySearchNodeData,
} from "@/types/workflow";

/**
 * Validates a workflow for structural integrity and execution readiness
 */
export function validateWorkflow(workflow: Workflow): ValidationResult {
  const errors: ValidationError[] = [];

  // Basic structure validation
  if (!workflow.nodes || workflow.nodes.length === 0) {
    errors.push({
      message: "Workflow must contain at least one node",
      type: "error",
    });
    return { valid: false, errors };
  }

  // Check for cycles in the DAG
  const cycleError = detectCycles(workflow.nodes, workflow.edges);
  if (cycleError) {
    errors.push(cycleError);
  }

  // Validate individual nodes
  workflow.nodes.forEach((node) => {
    const nodeErrors = validateNode(node);
    errors.push(...nodeErrors);
  });

  // Validate edges
  workflow.edges.forEach((edge) => {
    const edgeErrors = validateEdge(edge, workflow.nodes);
    errors.push(...edgeErrors);
  });

  // Check for at least one input node
  const hasInput = workflow.nodes.some((n) => n.type === NodeType.INPUT);
  if (!hasInput) {
    errors.push({
      message: "Workflow must have at least one Input node",
      type: "warning",
    });
  }

  // Check for at least one output node
  const hasOutput = workflow.nodes.some((n) => n.type === NodeType.OUTPUT);
  if (!hasOutput) {
    errors.push({
      message: "Workflow should have at least one Output node",
      type: "warning",
    });
  }

  // Check for disconnected nodes
  const disconnectedNodes = findDisconnectedNodes(
    workflow.nodes,
    workflow.edges
  );
  disconnectedNodes.forEach((nodeId) => {
    errors.push({
      nodeId,
      message: "Node is not connected to the workflow",
      type: "warning",
    });
  });

  return {
    valid: errors.filter((e) => e.type === "error").length === 0,
    errors,
  };
}

// Node-specific validators (DRY pattern)
type NodeValidator = (node: WorkflowNode) => ValidationError[];

const validateInputNode: NodeValidator = () => {
  // Input nodes are valid with minimal config
  return [];
};

const validateLLMTaskNode: NodeValidator = (node) => {
  const errors: ValidationError[] = [];
  const llmData = node.data as LLMTaskNodeData;
  
  if (!llmData.prompt && llmData.prompt !== "") {
    errors.push({
      nodeId: node.id,
      message: "LLM Task node requires a prompt",
      type: "error",
    });
  }
  
  return errors;
};

const validateWebScraperNode: NodeValidator = (node) => {
  const errors: ValidationError[] = [];
  const scraperData = node.data as WebScraperNodeData;
  
  if (!scraperData.url) {
    errors.push({
      nodeId: node.id,
      message: "Web Scraper node requires a URL",
      type: "error",
    });
  } else if (!isValidUrl(scraperData.url)) {
    errors.push({
      nodeId: node.id,
      message: "Invalid URL format",
      type: "error",
    });
  }
  
  return errors;
};

const validateStructuredOutputNode: NodeValidator = (node) => {
  const errors: ValidationError[] = [];
  const structuredData = node.data as StructuredOutputNodeData;
  
  if (!structuredData.schema) {
    errors.push({
      nodeId: node.id,
      message: "Structured Output node requires a schema",
      type: "error",
    });
  } else {
    try {
      JSON.parse(structuredData.schema);
    } catch {
      errors.push({
        nodeId: node.id,
        message: "Invalid JSON schema",
        type: "error",
      });
    }
  }
  
  return errors;
};

const validateEmbeddingGeneratorNode: NodeValidator = (node) => {
  const errors: ValidationError[] = [];
  const embeddingData = node.data as EmbeddingGeneratorNodeData;
  
  // Validate model if provided
  if (embeddingData.model) {
    const validModels = ["embed-english-v3.0", "embed-multilingual-v3.0"];
    if (!validModels.includes(embeddingData.model)) {
      errors.push({
        nodeId: node.id,
        message: `Invalid embedding model. Must be one of: ${validModels.join(", ")}`,
        type: "warning",
      });
    }
  }
  
  return errors;
};

const validateSimilaritySearchNode: NodeValidator = (node) => {
  const errors: ValidationError[] = [];
  const searchData = node.data as SimilaritySearchNodeData;
  
  if (!searchData.collectionName) {
    errors.push({
      nodeId: node.id,
      message: "Similarity Search node requires a collection name",
      type: "error",
    });
  }
  
  if (searchData.topK !== undefined) {
    if (searchData.topK < 1 || searchData.topK > 100) {
      errors.push({
        nodeId: node.id,
        message: "topK must be between 1 and 100",
        type: "error",
      });
    }
  }
  
  if (searchData.scoreThreshold !== undefined) {
    if (searchData.scoreThreshold < 0 || searchData.scoreThreshold > 1) {
      errors.push({
        nodeId: node.id,
        message: "Score threshold must be between 0 and 1",
        type: "error",
      });
    }
  }
  
  return errors;
};

const validateTextToSpeechNode: NodeValidator = () => {
  // Text-to-speech nodes can work with input from previous nodes
  // No strict validation needed
  return [];
};

const validateTextToImageNode: NodeValidator = () => {
  // Text-to-image nodes can work with input from previous nodes
  // No strict validation needed
  return [];
};

const validateImageToVideoNode: NodeValidator = () => {
  // Image-to-video nodes can work with input from previous nodes
  // No strict validation needed
  return [];
};

const validateTextExportNode: NodeValidator = () => {
  // Text export can work with upstream inputs; minimal config required
  return [];
};

const validateOutputNode: NodeValidator = () => {
  // Output nodes are valid with minimal config
  return [];
};

// Validator registry - DRY pattern for node validation
const NODE_VALIDATORS: Record<NodeType, NodeValidator> = {
  [NodeType.INPUT]: validateInputNode,
  [NodeType.LLM_TASK]: validateLLMTaskNode,
  [NodeType.WEB_SCRAPER]: validateWebScraperNode,
  [NodeType.STRUCTURED_OUTPUT]: validateStructuredOutputNode,
  [NodeType.EMBEDDING_GENERATOR]: validateEmbeddingGeneratorNode,
  [NodeType.SIMILARITY_SEARCH]: validateSimilaritySearchNode,
  [NodeType.TEXT_TO_SPEECH]: validateTextToSpeechNode,
  [NodeType.TEXT_TO_IMAGE]: validateTextToImageNode,
  [NodeType.IMAGE_TO_VIDEO]: validateImageToVideoNode,
  [NodeType.TEXT_EXPORT]: validateTextExportNode,
  [NodeType.OUTPUT]: validateOutputNode,
};

/**
 * Validates a single node's configuration
 */
function validateNode(node: WorkflowNode): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!node.id) {
    errors.push({
      nodeId: node.id,
      message: "Node missing ID",
      type: "error",
    });
  }

  if (!node.type) {
    errors.push({
      nodeId: node.id,
      message: "Node missing type",
      type: "error",
    });
    return errors;
  }

  // Use validator from registry
  const validator = NODE_VALIDATORS[node.type];
  if (validator) {
    errors.push(...validator(node));
  } else {
    errors.push({
      nodeId: node.id,
      message: `Unknown node type: ${node.type}`,
      type: "error",
    });
  }

  return errors;
}

/**
 * Validates an edge connection
 */
function validateEdge(
  edge: WorkflowEdge,
  nodes: WorkflowNode[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  const sourceNode = nodes.find((n) => n.id === edge.source);
  const targetNode = nodes.find((n) => n.id === edge.target);

  if (!sourceNode) {
    errors.push({
      edgeId: edge.id,
      message: `Edge source node "${edge.source}" not found`,
      type: "error",
    });
  }

  if (!targetNode) {
    errors.push({
      edgeId: edge.id,
      message: `Edge target node "${edge.target}" not found`,
      type: "error",
    });
  }

  // Prevent connecting output nodes as sources
  if (targetNode?.type === NodeType.INPUT) {
    errors.push({
      edgeId: edge.id,
      message: "Cannot connect to an Input node",
      type: "error",
    });
  }

  // Prevent connecting output nodes as sources
  if (sourceNode?.type === NodeType.OUTPUT) {
    errors.push({
      edgeId: edge.id,
      message: "Cannot connect from an Output node",
      type: "error",
    });
  }

  return errors;
}

/**
 * Detects cycles in the workflow graph using DFS
 */
function detectCycles(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): ValidationError | null {
  const graph = buildAdjacencyList(nodes, edges);
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycleDFS(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = graph.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycleDFS(neighbor)) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        return true; // Cycle detected
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (hasCycleDFS(node.id)) {
        return {
          message: "Workflow contains a cycle, which is not allowed",
          type: "error",
        };
      }
    }
  }

  return null;
}

/**
 * Finds nodes that are not connected to the workflow
 */
function findDisconnectedNodes(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): string[] {
  if (nodes.length <= 1) return [];

  const connectedNodes = new Set<string>();
  edges.forEach((edge) => {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  });

  return nodes
    .filter((node) => !connectedNodes.has(node.id))
    .map((node) => node.id);
}

/**
 * Builds an adjacency list representation of the graph
 */
function buildAdjacencyList(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): Map<string, string[]> {
  const graph = new Map<string, string[]>();

  // Initialize with all nodes
  nodes.forEach((node) => {
    graph.set(node.id, []);
  });

  // Add edges
  edges.forEach((edge) => {
    const neighbors = graph.get(edge.source) || [];
    neighbors.push(edge.target);
    graph.set(edge.source, neighbors);
  });

  return graph;
}

/**
 * Simple URL validation
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Performs topological sort on the workflow DAG
 * Returns nodes in execution order
 */
export function topologicalSort(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowNode[] {
  const graph = buildAdjacencyList(nodes, edges);
  const inDegree = new Map<string, number>();

  // Initialize in-degrees
  nodes.forEach((node) => {
    inDegree.set(node.id, 0);
  });

  // Calculate in-degrees
  edges.forEach((edge) => {
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });

  // Find all nodes with no incoming edges
  const queue: string[] = [];
  nodes.forEach((node) => {
    if (inDegree.get(node.id) === 0) {
      queue.push(node.id);
    }
  });

  const sorted: WorkflowNode[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodeMap.get(nodeId);
    if (node) {
      sorted.push(node);
    }

    const neighbors = graph.get(nodeId) || [];
    neighbors.forEach((neighbor) => {
      const newInDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newInDegree);
      if (newInDegree === 0) {
        queue.push(neighbor);
      }
    });
  }

  return sorted;
}

/**
 * Groups nodes by execution depth (level) for parallel execution
 */
export function groupNodesByDepth(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowNode[][] {
  const graph = buildAdjacencyList(nodes, edges);
  const depths = new Map<string, number>();
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Calculate depth for each node
  function calculateDepth(nodeId: string, visited = new Set<string>()): number {
    if (depths.has(nodeId)) {
      return depths.get(nodeId)!;
    }

    if (visited.has(nodeId)) {
      return 0; // Cycle detected, return 0
    }

    visited.add(nodeId);

    // Find all incoming edges
    const incomingEdges = edges.filter((e) => e.target === nodeId);

    if (incomingEdges.length === 0) {
      depths.set(nodeId, 0);
      return 0;
    }

    const maxDepth = Math.max(
      ...incomingEdges.map((e) => calculateDepth(e.source, new Set(visited)))
    );

    const depth = maxDepth + 1;
    depths.set(nodeId, depth);
    return depth;
  }

  // Calculate depths for all nodes
  nodes.forEach((node) => {
    calculateDepth(node.id);
  });

  // Group by depth
  const depthGroups = new Map<number, WorkflowNode[]>();
  nodes.forEach((node) => {
    const depth = depths.get(node.id) || 0;
    if (!depthGroups.has(depth)) {
      depthGroups.set(depth, []);
    }
    depthGroups.get(depth)!.push(node);
  });

  // Convert to array of arrays, sorted by depth
  const sortedDepths = Array.from(depthGroups.keys()).sort((a, b) => a - b);
  return sortedDepths.map((depth) => depthGroups.get(depth)!);
}

