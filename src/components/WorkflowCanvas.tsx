"use client";

import React, { useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";

import { useWorkflowStore } from "@/store/workflowStore";
import { InputNode } from "./nodes/InputNode";
import { LLMTaskNode } from "./nodes/LLMTaskNode";
import { WebScraperNode } from "./nodes/WebScraperNode";
import { StructuredOutputNode } from "./nodes/StructuredOutputNode";
import { EmbeddingGeneratorNode } from "./nodes/EmbeddingGeneratorNode";
import { VectorStoreNode } from "./nodes/VectorStoreNode";
import { SimilaritySearchNode } from "./nodes/SimilaritySearchNode";
import { TextToSpeechNode } from "./nodes/TextToSpeechNode";
import { TextToImageNode } from "./nodes/TextToImageNode";
import { ImageToVideoNode } from "./nodes/ImageToVideoNode";
import { OutputNode } from "./nodes/OutputNode";
import { NodeType } from "@/types/workflow";
import { TextExportNode } from "./nodes/TextExportNode";

const nodeTypes: NodeTypes = {
  [NodeType.INPUT]: InputNode,
  [NodeType.LLM_TASK]: LLMTaskNode,
  [NodeType.WEB_SCRAPER]: WebScraperNode,
  [NodeType.STRUCTURED_OUTPUT]: StructuredOutputNode,
  [NodeType.EMBEDDING_GENERATOR]: EmbeddingGeneratorNode,
  [NodeType.VECTOR_STORE]: VectorStoreNode,
  [NodeType.SIMILARITY_SEARCH]: SimilaritySearchNode,
  [NodeType.TEXT_TO_SPEECH]: TextToSpeechNode,
  [NodeType.TEXT_TO_IMAGE]: TextToImageNode,
  [NodeType.IMAGE_TO_VIDEO]: ImageToVideoNode,
  [NodeType.TEXT_EXPORT]: TextExportNode,
  [NodeType.OUTPUT]: OutputNode,
};

export function WorkflowCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectNode,
  } = useWorkflowStore();

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: any) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  return (
    <div className="w-full h-full bg-[var(--background)]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable className="bg-white/50 dark:bg-white/10" />
      </ReactFlow>
    </div>
  );
}

