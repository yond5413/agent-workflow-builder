"use client";

import React, { useRef } from "react";
import { useWorkflowStore } from "@/store/workflowStore";
import { Button } from "./ui/Button";
import { ThemeToggle } from "./ThemeToggle";
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
    <div className="h-16 bg-[var(--background)] border-b border-[var(--border)] flex items-center justify-between px-6 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/20">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-[var(--foreground)]">Workflow Builder</h1>
        <div className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
          <span>{nodes.length} nodes</span>
          <span className="text-[var(--border)]">•</span>
          <span>{edges.length} connections</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isExecuting ? (
          <Button variant="danger" onClick={onStop}>
            ⏹️ Stop
          </Button>
        ) : (
          <Button onClick={onExecute} disabled={nodes.length === 0}>
            ▶️ Run Workflow
          </Button>
        )}

        {executionStatus !== WorkflowExecutionStatus.IDLE && !isExecuting && (
          <Button variant="secondary" onClick={handleReset}>
            🔄 Reset
          </Button>
        )}

        <div className="w-px h-8 bg-[var(--border)] mx-2" />

        <Button variant="secondary" onClick={handleSave} disabled={nodes.length === 0}>
          💾 Save
        </Button>
        <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
          📁 Load
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleLoad}
          className="hidden"
        />
        <Button variant="ghost" onClick={handleClear} disabled={nodes.length === 0}>
          🗑️ Clear
        </Button>

        <div className="ml-2">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

