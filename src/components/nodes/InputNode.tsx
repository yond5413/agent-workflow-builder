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
      <div className="text-xs">
        {data.payload ? (
          <pre
            className="bg-white/60 dark:bg-white/5 border border-[var(--border)] rounded p-2 max-h-24 overflow-auto whitespace-pre-wrap break-words"
            title={typeof data.payload === 'string' ? data.payload : ''}
          >
            {typeof data.payload === 'string'
              ? data.payload
              : JSON.stringify(data.payload, null, 2)}
          </pre>
        ) : (
          <p className="text-[color:var(--muted)]">No input yet</p>
        )}
      </div>
    </BaseNode>
  );
}

