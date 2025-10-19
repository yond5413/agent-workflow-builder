import React from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";

export function StructuredOutputNode({ id, data, selected }: NodeProps) {
  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      icon="📊"
      title="Structured Output"
    >
      {data.schema && (
        <p className="text-gray-700 font-mono text-xs truncate" title={data.schema}>
          {data.schema.substring(0, 50)}
          {data.schema.length > 50 && "..."}
        </p>
      )}
      {data.model && (
        <p className="text-gray-600">
          <span className="font-medium">Model:</span> {data.model}
        </p>
      )}
    </BaseNode>
  );
}

