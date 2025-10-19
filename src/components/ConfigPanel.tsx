"use client";

import React from "react";
import { useWorkflowStore } from "@/store/workflowStore";
import { NodeType } from "@/types/workflow";

export function ConfigPanel() {
  const { nodes, selectedNodeId, updateNodeData, deleteNode } = useWorkflowStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
        <div className="text-center text-gray-500 mt-8">
          <p className="text-lg mb-2">No node selected</p>
          <p className="text-sm">Select a node to configure its properties</p>
        </div>
      </div>
    );
  }

  const handleDataChange = (field: string, value: any) => {
    updateNodeData(selectedNode.id, { [field]: value });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this node?")) {
      deleteNode(selectedNode.id);
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="mb-4">
        <h2 className="text-lg font-bold mb-1">{(selectedNode.type || "").replace("_", " ").toUpperCase()}</h2>
        <p className="text-sm text-gray-600">ID: {selectedNode.id}</p>
      </div>

      <div className="space-y-4">
        {/* Common field: Label */}
        <div>
          <label className="block text-sm font-medium mb-1">Label</label>
          <input
            type="text"
            value={selectedNode.data.label || ""}
            onChange={(e) => handleDataChange("label", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Node label"
          />
        </div>

        {/* Type-specific fields */}
        {selectedNode.type === NodeType.INPUT && (
          <div>
            <label className="block text-sm font-medium mb-1">Input Data</label>
            <textarea
              value={selectedNode.data.payload || ""}
              onChange={(e) => handleDataChange("payload", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
              rows={6}
              placeholder="Enter text or JSON data..."
            />
          </div>
        )}

        {selectedNode.type === NodeType.LLM_TASK && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Prompt</label>
              <textarea
                value={selectedNode.data.prompt || ""}
                onChange={(e) => handleDataChange("prompt", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                rows={6}
                placeholder="Enter your prompt here... Use {{input}} to reference input from previous nodes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model</label>
              <select
                value={selectedNode.data.model || "openai/gpt-3.5-turbo"}
                onChange={(e) => handleDataChange("model", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="openai/gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="openai/gpt-4">GPT-4</option>
                <option value="openai/gpt-4-turbo">GPT-4 Turbo</option>
                <option value="anthropic/claude-3-sonnet">Claude 3 Sonnet</option>
                <option value="anthropic/claude-3-opus">Claude 3 Opus</option>
                <option value="google/gemini-pro">Gemini Pro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Temperature: {selectedNode.data.temperature || 0.7}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={selectedNode.data.temperature || 0.7}
                onChange={(e) => handleDataChange("temperature", parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Tokens</label>
              <input
                type="number"
                value={selectedNode.data.max_tokens || 1000}
                onChange={(e) => handleDataChange("max_tokens", parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                min="1"
                max="4000"
              />
            </div>
          </>
        )}

        {selectedNode.type === NodeType.WEB_SCRAPER && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">URL</label>
              <input
                type="url"
                value={selectedNode.data.url || ""}
                onChange={(e) => handleDataChange("url", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Length</label>
              <input
                type="number"
                value={selectedNode.data.max_length || 5000}
                onChange={(e) => handleDataChange("max_length", parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                min="100"
                max="50000"
              />
            </div>
          </>
        )}

        {selectedNode.type === NodeType.STRUCTURED_OUTPUT && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">JSON Schema</label>
              <textarea
                value={selectedNode.data.schema || "{}"}
                onChange={(e) => handleDataChange("schema", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                rows={8}
                placeholder='{"name": "string", "age": "number"}'
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model</label>
              <select
                value={selectedNode.data.model || "openai/gpt-3.5-turbo"}
                onChange={(e) => handleDataChange("model", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="openai/gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="openai/gpt-4">GPT-4</option>
                <option value="openai/gpt-4-turbo">GPT-4 Turbo</option>
                <option value="anthropic/claude-3-sonnet">Claude 3 Sonnet</option>
                <option value="anthropic/claude-3-opus">Claude 3 Opus</option>
              </select>
            </div>
          </>
        )}

        {selectedNode.type === NodeType.OUTPUT && (
          <div className="text-sm text-gray-600">
            This node outputs the final result of the workflow.
          </div>
        )}

        {/* Output preview */}
        {selectedNode.data.output && (
          <div>
            <label className="block text-sm font-medium mb-1">Output</label>
            <pre className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-xs overflow-auto max-h-40">
              {typeof selectedNode.data.output === "string"
                ? selectedNode.data.output
                : JSON.stringify(selectedNode.data.output, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Delete button */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={handleDelete}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
        >
          Delete Node
        </button>
      </div>
    </div>
  );
}

