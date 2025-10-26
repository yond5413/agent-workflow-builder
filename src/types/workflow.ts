// Node Types
export enum NodeType {
  INPUT = "input",
  LLM_TASK = "llm_task",
  WEB_SCRAPER = "web_scraper",
  STRUCTURED_OUTPUT = "structured_output",
  EMBEDDING_GENERATOR = "embedding_generator",
  SIMILARITY_SEARCH = "similarity_search",
  TEXT_TO_SPEECH = "text_to_speech",
  TEXT_TO_IMAGE = "text_to_image",
  IMAGE_TO_VIDEO = "image_to_video",
  TEXT_EXPORT = "text_export",
  OUTPUT = "output",
}

// Execution States
export enum NodeExecutionState {
  IDLE = "idle",
  RUNNING = "running",
  SUCCESS = "success",
  ERROR = "error",
}

export enum WorkflowExecutionStatus {
  IDLE = "idle",
  RUNNING = "running",
  COMPLETED = "completed",
  ERROR = "error",
  CANCELLED = "cancelled",
}

// Node Data Interfaces
export interface InputNodeData {
  label?: string;
  payload?: string;
  output?: any;
}

export interface LLMTaskNodeData {
  label?: string;
  prompt?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  output?: any;
}

export interface WebScraperNodeData {
  label?: string;
  url?: string;
  max_length?: number;
  output?: any;
}

export interface StructuredOutputNodeData {
  label?: string;
  schema?: string; // JSON schema as string
  model?: string;
  output?: any;
}

export interface OutputNodeData {
  label?: string;
  output?: any;
}

export interface EmbeddingGeneratorNodeData {
  label?: string;
  model?: string;
  inputType?: "search_document" | "search_query" | "classification" | "clustering";
  text?: string; // Optional custom text input
  output?: any;
}

export interface SimilaritySearchNodeData {
  label?: string;
  collectionName?: string;
  topK?: number;
  scoreThreshold?: number;
  queryText?: string; // Optional text query (will be auto-embedded)
  output?: any;
}

export interface TextToSpeechNodeData {
  label?: string;
  text?: string;
  voiceId?: string;
  output?: any; // Base64 encoded audio
}

export interface TextToImageNodeData {
  label?: string;
  prompt?: string;
  output?: any; // Base64 encoded image
}

export interface ImageToVideoNodeData {
  label?: string;
  images?: string[]; // Array of base64 encoded images
  audioBase64?: string; // Optional base64 encoded audio
  duration?: number; // Seconds per image
  output?: any; // Base64 encoded video
}

export type ExportFormat = "csv" | "pdf";

export interface TextExportNodeData {
  label?: string;
  format?: ExportFormat; // 'csv' | 'pdf'
  filename?: string; // e.g., "summary-{timestamp}.{ext}"
  columns?: string[]; // CSV columns order
  columnMap?: Record<string, string>; // field -> CSV header title
  includeTimestamp?: boolean; // append createdAt in filename
  pdf?: {
    template?: "transcript-summary";
    title?: string;
    subtitle?: string;
    readingLevel?: "plain";
  };
  output?: any; // file artifact metadata { type, format, filename, dataUrl }
}

export type NodeData =
  | InputNodeData
  | LLMTaskNodeData
  | WebScraperNodeData
  | StructuredOutputNodeData
  | EmbeddingGeneratorNodeData
  | SimilaritySearchNodeData
  | TextToSpeechNodeData
  | TextToImageNodeData
  | ImageToVideoNodeData
  | TextExportNodeData
  | OutputNodeData;

// Workflow Node
export interface WorkflowNode {
  id: string;
  type: NodeType;
  data: NodeData;
  position: { x: number; y: number };
  executionState?: NodeExecutionState;
}

// Workflow Edge
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

// Complete Workflow
export interface Workflow {
  id: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata: {
    created_by?: string;
    created_at?: string;
    updated_at?: string;
    name?: string;
    description?: string;
  };
}

// Execution Log
export interface ExecutionLog {
  id: string;
  timestamp: number;
  nodeId?: string;
  level: "info" | "success" | "error" | "warning";
  message: string;
}

// Execution Result
export interface NodeExecutionResult {
  nodeId: string;
  success: boolean;
  output?: any;
  error?: string;
  executionTime?: number;
}

export interface WorkflowExecutionResult {
  success: boolean;
  results: Record<string, NodeExecutionResult>;
  logs: ExecutionLog[];
  error?: string;
}

// Validation Result
export interface ValidationError {
  nodeId?: string;
  edgeId?: string;
  message: string;
  type: "error" | "warning";
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

