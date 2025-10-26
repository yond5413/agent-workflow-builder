"use client";

import React, { useState, useCallback } from "react";
import { ReactFlowProvider } from "reactflow";
import { WorkflowCanvas } from "@/components/WorkflowCanvas";
import { NodePalette } from "@/components/NodePalette";
import { ConfigPanel } from "@/components/ConfigPanel";
import { Toolbar } from "@/components/Toolbar";
import { LogPanel } from "@/components/LogPanel";
import { useWorkflowStore } from "@/store/workflowStore";
import { exportWorkflow } from "@/lib/workflow-io";
import {
  WorkflowExecutionStatus,
  NodeExecutionState,
  ExecutionLog,
} from "@/types/workflow";

export default function Home() {
  const {
    nodes,
    edges,
    setExecutionStatus,
    setNodeExecutionState,
    addLog,
    clearLogs,
    updateNodeData,
  } = useWorkflowStore();

  const [isExecuting, setIsExecuting] = useState(false);
  const [engineRef, setEngineRef] = useState<any | null>(null);

  const handleExecute = useCallback(async () => {
    if (nodes.length === 0) {
      alert("Add some nodes first!");
      return;
    }

    setIsExecuting(true);
    setExecutionStatus(WorkflowExecutionStatus.RUNNING);
    clearLogs();

    // Reset all node states
    nodes.forEach((node) => {
      setNodeExecutionState(node.id, NodeExecutionState.IDLE);
      updateNodeData(node.id, { output: undefined });
    });

    const workflow = exportWorkflow(nodes, edges);

    // Execute workflow CLIENT-SIDE to support browser-only nodes (image-to-video)
    try {
      // Dynamic import to ensure client-side execution
      const { WorkflowEngine } = await import("@/lib/engine");
      
      const engine = new WorkflowEngine(workflow, {
        onStateChange: (nodeId, state) => {
          setNodeExecutionState(nodeId, state);
        },
        onLog: (log) => {
          addLog(log);
        },
        baseUrl: window.location.origin,
      });
      
      // Store engine reference for cancellation
      setEngineRef(engine);

      const result = await engine.execute();

      if (result.success) {
        setExecutionStatus(WorkflowExecutionStatus.COMPLETED);
        
        // Update node outputs and states
        Object.entries(result.results).forEach(([nodeId, nodeResult]: [string, any]) => {
          if (nodeResult.success) {
            setNodeExecutionState(nodeId, NodeExecutionState.SUCCESS);
            updateNodeData(nodeId, { output: nodeResult.output });
          } else {
            setNodeExecutionState(nodeId, NodeExecutionState.ERROR);
          }
        });

        // Add logs
        if (result.logs && Array.isArray(result.logs)) {
          result.logs.forEach((log: ExecutionLog) => addLog(log));
        }

        addLog({
          id: `final-${Date.now()}`,
          timestamp: Date.now(),
          level: "success",
          message: "✨ Workflow completed successfully!",
        });
      } else {
        setExecutionStatus(WorkflowExecutionStatus.ERROR);
        
        // Add error logs
        if (result.logs && Array.isArray(result.logs)) {
          result.logs.forEach((log: ExecutionLog) => addLog(log));
        }

        addLog({
          id: `error-${Date.now()}`,
          timestamp: Date.now(),
          level: "error",
          message: `Workflow failed: ${result.error || "Unknown error"}`,
        });

        // Show validation errors if present
        if (result.validationErrors && Array.isArray(result.validationErrors)) {
          result.validationErrors.forEach((error: any) => {
            addLog({
              id: `validation-${Date.now()}-${Math.random()}`,
              timestamp: Date.now(),
              level: "error",
              message: `Validation: ${error.message}`,
              nodeId: error.nodeId,
            });
          });
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setExecutionStatus(WorkflowExecutionStatus.CANCELLED);
        addLog({
          id: `cancelled-${Date.now()}`,
          timestamp: Date.now(),
          level: "warning",
          message: "Workflow execution cancelled by user",
        });
      } else {
        setExecutionStatus(WorkflowExecutionStatus.ERROR);
        addLog({
          id: `error-${Date.now()}`,
          timestamp: Date.now(),
          level: "error",
          message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    } finally {
      setIsExecuting(false);
      setEngineRef(null);
    }
  }, [nodes, edges, setExecutionStatus, setNodeExecutionState, addLog, clearLogs, updateNodeData]);

  const handleStop = useCallback(() => {
    if (engineRef) {
      engineRef.cancel();
      addLog({
        id: `stop-${Date.now()}`,
        timestamp: Date.now(),
        level: "warning",
        message: "Stopping workflow...",
      });
    }
  }, [engineRef, addLog]);

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen flex flex-col overflow-hidden">
        <Toolbar
          onExecute={handleExecute}
          onStop={handleStop}
          isExecuting={isExecuting}
        />

        <div className="flex-1 flex overflow-hidden">
          <NodePalette />
          
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-hidden">
              <WorkflowCanvas />
            </div>
            <LogPanel />
          </div>

          <ConfigPanel />
        </div>
      </div>
    </ReactFlowProvider>
  );
}
