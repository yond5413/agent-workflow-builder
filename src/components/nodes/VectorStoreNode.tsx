import React from "react";
import { BaseNode } from "./BaseNode";
import { VectorStoreNodeData } from "@/types/workflow";

interface VectorStoreNodeProps {
  id: string;
  data: VectorStoreNodeData;
  selected?: boolean;
}

export function VectorStoreNode({
  id,
  data,
  selected,
}: VectorStoreNodeProps) {
  return (
    <BaseNode id={id} data={data} selected={selected} icon="🗄️" title="Vector Store">
      <div className="text-gray-700">
        {data.collectionName ? (
          <>
            <p>
              <span className="font-medium">Collection:</span> {data.collectionName}
            </p>
            <p>
              <span className="font-medium">Vector Size:</span>{" "}
              {data.vectorSize || 1024}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Stores embeddings in Qdrant
            </p>
          </>
        ) : (
          <p className="text-gray-500 italic">Not configured</p>
        )}
      </div>
    </BaseNode>
  );
}

