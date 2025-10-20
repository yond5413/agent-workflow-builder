import { create } from "zustand";
import {
  WorkflowNode,
  WorkflowEdge,
  NodeExecutionState,
  WorkflowExecutionStatus,
  ExecutionLog,
  NodeType,
} from "@/types/workflow";
import { Node, Edge, addEdge, Connection, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from "reactflow";

interface WorkflowStore {
  // Workflow data
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;

  // Execution state
  executionStatus: WorkflowExecutionStatus;
  nodeExecutionStates: Map<string, NodeExecutionState>;
  logs: ExecutionLog[];

  // Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: any) => void;
  deleteNode: (nodeId: string) => void;
  
  selectNode: (nodeId: string | null) => void;
  
  setExecutionStatus: (status: WorkflowExecutionStatus) => void;
  setNodeExecutionState: (nodeId: string, state: NodeExecutionState) => void;
  addLog: (log: ExecutionLog) => void;
  clearLogs: () => void;
  
  clearWorkflow: () => void;
  loadWorkflow: (nodes: Node[], edges: Edge[]) => void;
  
  resetExecutionState: () => void;
}

// Generate unique node ID using crypto API
const generateNodeId = (type: NodeType): string => {
  // Use crypto.randomUUID if available, otherwise fallback to timestamp-based UUID
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${type}-${crypto.randomUUID()}`;
  }
  // Fallback for older browsers
  return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  selectedNodeId: null,
  executionStatus: WorkflowExecutionStatus.IDLE,
  nodeExecutionStates: new Map(),
  logs: [],

  // Actions
  setNodes: (nodes) => set({ nodes }),
  
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },

  addNode: (type, position) => {
    const id = generateNodeId(type);
    
    const defaultData: Record<NodeType, any> = {
      [NodeType.INPUT]: { label: "Input", payload: "" },
      [NodeType.LLM_TASK]: { label: "LLM Task", prompt: "", model: "z-ai/glm-4.5-air:free", temperature: 0.7, max_tokens: 1000 },
      [NodeType.WEB_SCRAPER]: { label: "Web Scraper", url: "", max_length: 5000 },
      [NodeType.STRUCTURED_OUTPUT]: { label: "Structured Output", schema: "{}", model: "z-ai/glm-4.5-air:free" },
      [NodeType.EMBEDDING_GENERATOR]: { label: "Embedding Generator", model: "embed-english-v3.0", inputType: "search_document" },
      [NodeType.SIMILARITY_SEARCH]: { label: "Similarity Search", collectionName: "", topK: 5, scoreThreshold: 0.7 },
      [NodeType.OUTPUT]: { label: "Output" },
    };

    const newNode: Node = {
      id,
      type: type,
      position,
      data: defaultData[type],
    };

    set({ nodes: [...get().nodes, newNode] });
  },

  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ),
    });
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((node) => node.id !== nodeId),
      edges: get().edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
    });
  },

  selectNode: (nodeId) => {
    set({ selectedNodeId: nodeId });
  },

  setExecutionStatus: (status) => {
    set({ executionStatus: status });
  },

  setNodeExecutionState: (nodeId, state) => {
    const newStates = new Map(get().nodeExecutionStates);
    newStates.set(nodeId, state);
    set({ nodeExecutionStates: newStates });
  },

  addLog: (log) => {
    set({ logs: [...get().logs, log] });
  },

  clearLogs: () => {
    set({ logs: [] });
  },

  clearWorkflow: () => {
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      logs: [],
      executionStatus: WorkflowExecutionStatus.IDLE,
      nodeExecutionStates: new Map(),
    });
  },

  loadWorkflow: (nodes, edges) => {
    set({
      nodes,
      edges,
      selectedNodeId: null,
      logs: [],
      executionStatus: WorkflowExecutionStatus.IDLE,
      nodeExecutionStates: new Map(),
    });
  },

  resetExecutionState: () => {
    set({
      executionStatus: WorkflowExecutionStatus.IDLE,
      nodeExecutionStates: new Map(),
      logs: [],
    });
    
    // Clear output from all nodes
    set({
      nodes: get().nodes.map((node) => ({
        ...node,
        data: { ...node.data, output: undefined },
      })),
    });
  },
}));

