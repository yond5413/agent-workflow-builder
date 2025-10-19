import React from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";

export function LLMTaskNode({ id, data, selected }: NodeProps) {
  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      icon="🤖"
      title="LLM Task"
    >
      {data.model && (
        <p className="text-gray-600">
          <span className="font-medium">Model:</span> {data.model}
        </p>
      )}
      {data.prompt && (
        <p className="text-gray-700 truncate" title={data.prompt}>
          <span className="font-medium">Prompt:</span> {data.prompt.substring(0, 40)}
          {data.prompt.length > 40 && "..."}
        </p>
      )}
    </BaseNode>
  );
}

