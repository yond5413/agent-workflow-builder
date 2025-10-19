import React from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";

export function OutputNode({ id, data, selected }: NodeProps) {
  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      showSource={false}
      icon="📤"
      title="Output"
    >
      <p className="text-gray-600">Final workflow output</p>
    </BaseNode>
  );
}

