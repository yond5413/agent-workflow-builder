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
                value={selectedNode.data.model || "z-ai/glm-4.5-air:free"}
                onChange={(e) => handleDataChange("model", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="z-ai/glm-4.5-air:free">GLM-4.5-AIR</option>
                <option value="deepseek/deepseek-r1:free">Deepseek-R1</option>
                <option value="openai/gpt-oss-20b:free">GPT-OSS-20B</option>
                <option value="amoonshotai/kimi-dev-72b:free">Kimi-Dev-72B</option>
                <option value="alibaba/tongyi-deepresearch-30b-a3b:free">Tongyi-Deepresearch-30B-A3B</option>
                <option value="qwen/qwen3-14b:free">Qwen-3.14B</option>
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
                value={selectedNode.data.model || "openai/gpt-oss-20b:free"}
                onChange={(e) => handleDataChange("model", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="z-ai/glm-4.5-air:free">GLM-4.5-AIR</option>
                <option value="deepseek/deepseek-r1:free">Deepseek-R1</option>
                <option value="openai/gpt-oss-20b:free">GPT-OSS-20B</option>
                <option value="amoonshotai/kimi-dev-72b:free">Kimi-Dev-72B</option>
                <option value="alibaba/tongyi-deepresearch-30b-a3b:free">Tongyi-Deepresearch-30B-A3B</option>
                <option value="qwen/qwen3-14b:free">Qwen-3.14B</option>
              </select>
            </div>
          </>
        )}

        {selectedNode.type === NodeType.EMBEDDING_GENERATOR && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Model</label>
              <select
                value={selectedNode.data.model || "embed-english-v3.0"}
                onChange={(e) => handleDataChange("model", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="embed-english-v3.0">Embed English v3.0</option>
                <option value="embed-multilingual-v3.0">Embed Multilingual v3.0</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Input Type</label>
              <select
                value={selectedNode.data.inputType || "search_document"}
                onChange={(e) => handleDataChange("inputType", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="search_document">Search Document</option>
                <option value="search_query">Search Query</option>
                <option value="classification">Classification</option>
                <option value="clustering">Clustering</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Custom Text (Optional)</label>
              <textarea
                value={selectedNode.data.text || ""}
                onChange={(e) => handleDataChange("text", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                rows={4}
                placeholder="Leave empty to use input from connected nodes..."
              />
              <p className="text-xs text-gray-500 mt-1">
                If provided, this text will be used instead of input from previous nodes.
              </p>
            </div>
          </>
        )}

        {selectedNode.type === NodeType.SIMILARITY_SEARCH && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Collection Name</label>
              <input
                type="text"
                value={selectedNode.data.collectionName || ""}
                onChange={(e) => handleDataChange("collectionName", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="my_collection"
              />
              <p className="text-xs text-gray-500 mt-1">
                Name of the Qdrant collection to search in.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Top K: {selectedNode.data.topK || 5}
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={selectedNode.data.topK || 5}
                onChange={(e) => handleDataChange("topK", parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of similar results to return (1-20).
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Score Threshold: {selectedNode.data.scoreThreshold || 0.7}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={selectedNode.data.scoreThreshold || 0.7}
                onChange={(e) => handleDataChange("scoreThreshold", parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum similarity score (0-1). Only results above this threshold will be returned.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Query Text (Optional)</label>
              <textarea
                value={selectedNode.data.queryText || ""}
                onChange={(e) => handleDataChange("queryText", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                rows={3}
                placeholder="Leave empty to use vector from connected nodes..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Text query to search for. Will be automatically embedded if provided.
              </p>
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

