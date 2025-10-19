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
import { OutputNode } from "./nodes/OutputNode";
import { NodeType } from "@/types/workflow";

const nodeTypes: NodeTypes = {
  [NodeType.INPUT]: InputNode,
  [NodeType.LLM_TASK]: LLMTaskNode,
  [NodeType.WEB_SCRAPER]: WebScraperNode,
  [NodeType.STRUCTURED_OUTPUT]: StructuredOutputNode,
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
    <div className="w-full h-full bg-gray-50">
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
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          className="bg-gray-100"
        />
      </ReactFlow>
    </div>
  );
}

