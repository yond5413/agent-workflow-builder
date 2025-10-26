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
    type: NodeType.EMBEDDING_GENERATOR,
    icon: "🧬",
    label: "Embedding Generator",
    description: "Generate text embeddings",
  },
  {
    type: NodeType.SIMILARITY_SEARCH,
    icon: "🔍",
    label: "Similarity Search",
    description: "Vector similarity search",
  },
  {
    type: NodeType.TEXT_TO_SPEECH,
    icon: "🔊",
    label: "Text to Speech",
    description: "Convert text to audio",
  },
  {
    type: NodeType.TEXT_TO_IMAGE,
    icon: "🎨",
    label: "Text to Image",
    description: "Generate images from text",
  },
  {
    type: NodeType.IMAGE_TO_VIDEO,
    icon: "🎬",
    label: "Image to Video",
    description: "Create video from images",
  },
  {
    type: NodeType.TEXT_EXPORT,
    icon: "📄",
    label: "Text Export",
    description: "Export CSV or PDF",
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
    <div className="w-64 bg-[var(--background)] border-r border-[var(--border)] p-4 overflow-y-auto">
      <h2 className="text-lg font-bold mb-4 text-[var(--foreground)]">Node Palette</h2>
      
      <div className="space-y-2">
        {nodeTypes.map((nodeType) => (
          <button
            key={nodeType.type}
            onClick={() => handleAddNode(nodeType.type)}
            className="w-full p-3 bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border-2 border-[var(--border)] hover:border-[var(--primary)] rounded-lg transition-all text-left group"
          >
            <div className="flex items-start gap-2">
              <span className="text-2xl">{nodeType.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-[var(--foreground)] group-hover:text-[var(--primary)]">
                  {nodeType.label}
                </h3>
                <p className="text-xs text-[color:var(--muted)] mt-1">
                  {nodeType.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-[var(--border)]">
        <h3 className="font-semibold text-sm text-[var(--foreground)] mb-2">How to use</h3>
        <ul className="text-xs text-[color:var(--muted)] space-y-2">
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

