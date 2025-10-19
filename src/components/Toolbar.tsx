"use client";

import React, { useRef } from "react";
import { useWorkflowStore } from "@/store/workflowStore";
import { exportWorkflow, importWorkflow, downloadJSON } from "@/lib/workflow-io";
import { WorkflowExecutionStatus, NodeExecutionState } from "@/types/workflow";

interface ToolbarProps {
  onExecute: () => void;
  onStop: () => void;
  isExecuting: boolean;
}

export function Toolbar({ onExecute, onStop, isExecuting }: ToolbarProps) {
  const { nodes, edges, loadWorkflow, clearWorkflow, resetExecutionState, executionStatus } =
    useWorkflowStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const workflow = exportWorkflow(nodes, edges);
    downloadJSON(workflow, `workflow-${Date.now()}.json`);
  };

  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const { nodes: loadedNodes, edges: loadedEdges } = importWorkflow(json);
        loadWorkflow(loadedNodes, loadedEdges);
      } catch (error) {
        alert("Failed to load workflow: " + (error instanceof Error ? error.message : "Unknown error"));
      }
    };
    reader.readAsText(file);
    
    // Reset the input value so the same file can be loaded again
    event.target.value = "";
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear the workflow?")) {
      clearWorkflow();
    }
  };

  const handleReset = () => {
    resetExecutionState();
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800">Workflow Builder</h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">{nodes.length} nodes</span>
          <span className="text-gray-300">•</span>
          <span className="text-gray-600">{edges.length} connections</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Execution controls */}
        {isExecuting ? (
          <button
            onClick={onStop}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium flex items-center gap-2"
          >
            <span>⏹️</span>
            Stop
          </button>
        ) : (
          <button
            onClick={onExecute}
            disabled={nodes.length === 0}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>▶️</span>
            Run Workflow
          </button>
        )}

        {executionStatus !== WorkflowExecutionStatus.IDLE && !isExecuting && (
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
          >
            <span>🔄</span>
            Reset
          </button>
        )}

        <div className="w-px h-8 bg-gray-300" />

        {/* File operations */}
        <button
          onClick={handleSave}
          disabled={nodes.length === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span>💾</span>
          Save
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
        >
          <span>📁</span>
          Load
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleLoad}
          className="hidden"
        />

        <button
          onClick={handleClear}
          disabled={nodes.length === 0}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span>🗑️</span>
          Clear
        </button>
      </div>
    </div>
  );
}

