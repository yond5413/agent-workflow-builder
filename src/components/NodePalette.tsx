"use client";

import React from "react";
import { useWorkflowStore } from "@/store/workflowStore";
import { NodeType } from "@/types/workflow";

interface NodeTypeInfo {
  type: NodeType;
  icon: string;
  label: string;
  description: string;
}

const nodeTypes: NodeTypeInfo[] = [
  {
    type: NodeType.INPUT,
    icon: "📥",
    label: "Input",
    description: "Starting point with data",
  },
  {
    type: NodeType.LLM_TASK,
    icon: "🤖",
    label: "LLM Task",
    description: "AI text generation",
  },
  {
    type: NodeType.WEB_SCRAPER,
    icon: "🌐",
    label: "Web Scraper",
    description: "Fetch web content",
  },
  {
    type: NodeType.STRUCTURED_OUTPUT,
    icon: "📊",
    label: "Structured Output",
    description: "Extract structured data",
  },
  {
    type: NodeType.OUTPUT,
    icon: "📤",
    label: "Output",
    description: "Final result",
  },
];

export function NodePalette() {
  const addNode = useWorkflowStore((state) => state.addNode);

  const handleAddNode = (type: NodeType) => {
    // Add node at a random position in the center area
    const position = {
      x: Math.random() * 300 + 100,
      y: Math.random() * 300 + 100,
    };
    addNode(type, position);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-bold mb-4 text-gray-800">Node Palette</h2>
      
      <div className="space-y-2">
        {nodeTypes.map((nodeType) => (
          <button
            key={nodeType.type}
            onClick={() => handleAddNode(nodeType.type)}
            className="w-full p-3 bg-gray-50 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-300 rounded-lg transition-all text-left group"
          >
            <div className="flex items-start gap-2">
              <span className="text-2xl">{nodeType.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-gray-800 group-hover:text-blue-600">
                  {nodeType.label}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {nodeType.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-semibold text-sm text-gray-700 mb-2">How to use</h3>
        <ul className="text-xs text-gray-600 space-y-2">
          <li>• Click a node type to add it</li>
          <li>• Drag nodes to reposition</li>
          <li>• Connect nodes by dragging from output to input</li>
          <li>• Click a node to configure it</li>
          <li>• Click Run to execute the workflow</li>
        </ul>
      </div>
    </div>
  );
}

