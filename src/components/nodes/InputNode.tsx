import React from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";

export function InputNode({ id, data, selected }: NodeProps) {
  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      showTarget={false}
      icon="📥"
      title="Input"
    >
      {data.payload && (
        <p className="text-gray-700 truncate" title={data.payload}>
          {data.payload.substring(0, 50)}
          {data.payload.length > 50 && "..."}
        </p>
      )}
    </BaseNode>
  );
}

