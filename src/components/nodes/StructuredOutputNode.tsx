import React from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";

export function StructuredOutputNode({ id, data, selected }: NodeProps) {
  const hasOutput = data.output && typeof data.output === 'object';
  const outputPreview = hasOutput ? JSON.stringify(data.output).substring(0, 60) : null;

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
        <p className="text-gray-600 text-sm">
          <span className="font-medium">Model:</span> {data.model}
        </p>
      )}
      {outputPreview && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-green-600 font-mono truncate" title={JSON.stringify(data.output, null, 2)}>
            <span className="font-medium">✓ Parsed:</span> {outputPreview}
            {JSON.stringify(data.output).length > 60 && "..."}
          </p>
        </div>
      )}
    </BaseNode>
  );
}

