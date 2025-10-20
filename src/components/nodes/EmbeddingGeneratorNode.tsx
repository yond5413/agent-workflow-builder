import React from "react";
import { BaseNode } from "./BaseNode";
import { EmbeddingGeneratorNodeData } from "@/types/workflow";

interface EmbeddingGeneratorNodeProps {
  id: string;
  data: EmbeddingGeneratorNodeData;
  selected?: boolean;
}

export function EmbeddingGeneratorNode({
  id,
  data,
  selected,
}: EmbeddingGeneratorNodeProps) {
  return (
    <BaseNode id={id} data={data} selected={selected} icon="🧬" title="Embedding Generator">
      <div className="text-gray-700">
        <p>
          <span className="font-medium">Model:</span>{" "}
          {data.model || "embed-english-v3.0"}
        </p>
        {data.inputType && (
          <p>
            <span className="font-medium">Type:</span> {data.inputType}
          </p>
        )}
        {data.text && (
          <p className="text-gray-600 italic truncate">
            Custom text: {data.text.substring(0, 30)}...
          </p>
        )}
      </div>
    </BaseNode>
  );
}

