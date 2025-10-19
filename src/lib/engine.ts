import {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  NodeExecutionResult,
  WorkflowExecutionResult,
  ExecutionLog,
  NodeType,
  NodeExecutionState,
  InputNodeData,
  LLMTaskNodeData,
  WebScraperNodeData,
  StructuredOutputNodeData,
} from "@/types/workflow";
import { groupNodesByDepth } from "./validator";

/**
 * Main execution engine for workflows
 */
export class WorkflowEngine {
  private workflow: Workflow;
  private nodeOutputs: Map<string, any>;
  private logs: ExecutionLog[];
  private abortController: AbortController;
  private onStateChange?: (nodeId: string, state: NodeExecutionState) => void;
  private onLog?: (log: ExecutionLog) => void;

  constructor(
    workflow: Workflow,
    callbacks?: {
      onStateChange?: (nodeId: string, state: NodeExecutionState) => void;
      onLog?: (log: ExecutionLog) => void;
    }
  ) {
    this.workflow = workflow;
    this.nodeOutputs = new Map();
    this.logs = [];
    this.abortController = new AbortController();
    this.onStateChange = callbacks?.onStateChange;
    this.onLog = callbacks?.onLog;
  }

  /**
   * Execute the workflow using DAG-based parallel execution
   */
  async execute(): Promise<WorkflowExecutionResult> {
    this.log("info", "Starting workflow execution");

    try {
      // Group nodes by depth for parallel execution
      const depthGroups = groupNodesByDepth(
        this.workflow.nodes,
        this.workflow.edges
      );

      this.log(
        "info",
        `Workflow has ${depthGroups.length} execution levels`
      );

      const results: Record<string, NodeExecutionResult> = {};

      // Execute each depth level
      for (let i = 0; i < depthGroups.length; i++) {
        if (this.abortController.signal.aborted) {
          this.log("warning", "Workflow execution cancelled");
          throw new Error("Execution cancelled");
        }

        const level = depthGroups[i];
        this.log(
          "info",
          `Executing level ${i + 1} with ${level.length} node(s): ${level.map((n) => n.id).join(", ")}`
        );

        // Execute all nodes in this level in parallel
        const levelResults = await Promise.all(
          level.map((node) => this.executeNode(node))
        );

        // Store results
        levelResults.forEach((result) => {
          results[result.nodeId] = result;
          if (result.success) {
            this.nodeOutputs.set(result.nodeId, result.output);
          }
        });

        // Check if any node failed
        const failed = levelResults.filter((r) => !r.success);
        if (failed.length > 0) {
          this.log(
            "error",
            `${failed.length} node(s) failed at level ${i + 1}`
          );
          throw new Error(
            `Nodes failed: ${failed.map((r) => r.nodeId).join(", ")}`
          );
        }
      }

      this.log("success", "Workflow execution completed successfully");

      return {
        success: true,
        results,
        logs: this.logs,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.log("error", `Workflow execution failed: ${errorMessage}`);

      return {
        success: false,
        results: {},
        logs: this.logs,
        error: errorMessage,
      };
    }
  }

  /**
   * Execute a single node
   */
  private async executeNode(node: WorkflowNode): Promise<NodeExecutionResult> {
    const startTime = Date.now();

    try {
      this.updateNodeState(node.id, NodeExecutionState.RUNNING);
      this.log("info", `Executing node: ${node.id} (${node.type})`, node.id);

      // Get input from connected nodes
      const input = this.getNodeInput(node.id);

      let output: any;

      switch (node.type) {
        case NodeType.INPUT:
          output = await this.executeInputNode(node);
          break;
        case NodeType.LLM_TASK:
          output = await this.executeLLMTaskNode(node, input);
          break;
        case NodeType.WEB_SCRAPER:
          output = await this.executeWebScraperNode(node);
          break;
        case NodeType.STRUCTURED_OUTPUT:
          output = await this.executeStructuredOutputNode(node, input);
          break;
        case NodeType.OUTPUT:
          output = await this.executeOutputNode(node, input);
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      const executionTime = Date.now() - startTime;
      this.updateNodeState(node.id, NodeExecutionState.SUCCESS);
      this.log(
        "success",
        `Node ${node.id} completed in ${executionTime}ms`,
        node.id
      );

      return {
        nodeId: node.id,
        success: true,
        output,
        executionTime,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.updateNodeState(node.id, NodeExecutionState.ERROR);
      this.log("error", `Node ${node.id} failed: ${errorMessage}`, node.id);

      return {
        nodeId: node.id,
        success: false,
        error: errorMessage,
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Execute Input Node
   */
  private async executeInputNode(node: WorkflowNode): Promise<any> {
    const nodeData = node.data as InputNodeData;
    const payload = nodeData.payload || nodeData.output;
    
    if (!payload) {
      return { data: "" };
    }

    // Try to parse as JSON, otherwise return as string
    try {
      return { data: JSON.parse(payload) };
    } catch {
      return { data: payload };
    }
  }

  /**
   * Execute LLM Task Node
   */
  private async executeLLMTaskNode(
    node: WorkflowNode,
    input: any
  ): Promise<any> {
    const nodeData = node.data as LLMTaskNodeData;
    const prompt = this.interpolateInput(nodeData.prompt || "", input);
    const model = nodeData.model || "openai/gpt-3.5-turbo";
    const temperature = nodeData.temperature || 0.7;
    const max_tokens = nodeData.max_tokens || 1000;

    const response = await fetch(`/api/fastapi/llm-task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, model, temperature, max_tokens }),
      signal: this.abortController.signal,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "LLM task failed");
    }

    return result.data;
  }

  /**
   * Execute Web Scraper Node
   */
  private async executeWebScraperNode(node: WorkflowNode): Promise<any> {
    const nodeData = node.data as WebScraperNodeData;
    const url = nodeData.url;
    const max_length = nodeData.max_length || 5000;

    if (!url) {
      throw new Error("URL is required for web scraper");
    }

    const response = await fetch(`/api/fastapi/web-scrape`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, max_length }),
      signal: this.abortController.signal,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Web scraping failed");
    }

    return result.data;
  }

  /**
   * Execute Structured Output Node
   */
  private async executeStructuredOutputNode(
    node: WorkflowNode,
    input: any
  ): Promise<any> {
    const nodeData = node.data as StructuredOutputNodeData;
    const schemaStr = nodeData.schema;
    const model = nodeData.model || "openai/gpt-3.5-turbo";

    if (!schemaStr) {
      throw new Error("Schema is required for structured output");
    }

    let schema;
    try {
      schema = JSON.parse(schemaStr);
    } catch {
      throw new Error("Invalid JSON schema");
    }

    // Extract text from input
    const text = this.extractTextFromInput(input);

    const response = await fetch(`/api/fastapi/structured-extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, schema, model }),
      signal: this.abortController.signal,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Structured extraction failed");
    }

    return result.data;
  }

  /**
   * Execute Output Node
   */
  private async executeOutputNode(node: WorkflowNode, input: any): Promise<any> {
    // Output node just passes through the input
    return input;
  }

  /**
   * Get input data for a node from its predecessors
   */
  private getNodeInput(nodeId: string): any {
    const incomingEdges = this.workflow.edges.filter((e) => e.target === nodeId);

    if (incomingEdges.length === 0) {
      return null;
    }

    if (incomingEdges.length === 1) {
      return this.nodeOutputs.get(incomingEdges[0].source);
    }

    // Multiple inputs - combine them
    const inputs: Record<string, any> = {};
    incomingEdges.forEach((edge) => {
      inputs[edge.source] = this.nodeOutputs.get(edge.source);
    });
    return inputs;
  }

  /**
   * Interpolate {{input}} placeholders in strings
   */
  private interpolateInput(text: string, input: any): string {
    if (!input) return text;

    // Replace {{input}} with the input value
    return text.replace(/\{\{input\}\}/g, () => {
      if (typeof input === "string") return input;
      if (input.text) return input.text;
      if (input.data) return JSON.stringify(input.data);
      return JSON.stringify(input);
    });
  }

  /**
   * Extract text from various input formats
   */
  private extractTextFromInput(input: any): string {
    if (!input) return "";
    if (typeof input === "string") return input;
    if (input.text) return input.text;
    if (input.content) return input.content;
    if (input.data) return JSON.stringify(input.data);
    return JSON.stringify(input);
  }

  /**
   * Update node execution state
   */
  private updateNodeState(nodeId: string, state: NodeExecutionState) {
    if (this.onStateChange) {
      this.onStateChange(nodeId, state);
    }
  }

  /**
   * Add a log entry
   */
  private log(
    level: "info" | "success" | "error" | "warning",
    message: string,
    nodeId?: string
  ) {
    const log: ExecutionLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      nodeId,
      level,
      message,
    };

    this.logs.push(log);

    if (this.onLog) {
      this.onLog(log);
    }
  }

  /**
   * Cancel the workflow execution
   */
  cancel() {
    this.abortController.abort();
    this.log("warning", "Cancelling workflow execution");
  }
}

