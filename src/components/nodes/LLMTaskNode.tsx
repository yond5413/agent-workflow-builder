import React from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";

export function LLMTaskNode({ id, data, selected }: NodeProps) {
  // Show response preview if available
  const hasResponse = data.output && typeof data.output === 'string';
  const responsePreview = hasResponse ? data.output.substring(0, 60) : null;

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      icon="🤖"
      title="LLM Task"
    >
      {data.model && (
        <p className="text-gray-600 text-sm">
          <span className="font-medium">Model:</span> {data.model}
        </p>
      )}
      {data.prompt && (
        <p className="text-gray-700 text-sm truncate" title={data.prompt}>
          <span className="font-medium">Prompt:</span> {data.prompt.substring(0, 40)}
          {data.prompt.length > 40 && "..."}
        </p>
      )}
      {responsePreview && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-green-600 truncate" title={data.output}>
            <span className="font-medium">✓ Response:</span> {responsePreview}
            {data.output.length > 60 && "..."}
          </p>
        </div>
      )}
    </BaseNode>
  );
}

