import React from "react";
import { BaseNode } from "./BaseNode";
import { SimilaritySearchNodeData } from "@/types/workflow";

interface SimilaritySearchNodeProps {
  id: string;
  data: SimilaritySearchNodeData;
  selected?: boolean;
}

export function SimilaritySearchNode({
  id,
  data,
  selected,
}: SimilaritySearchNodeProps) {
  return (
    <BaseNode id={id} data={data} selected={selected} icon="🔍" title="Similarity Search">
      <div className="text-gray-700">
        {data.collectionName ? (
          <>
            <p>
              <span className="font-medium">Collection:</span> {data.collectionName}
            </p>
            <p>
              <span className="font-medium">Top K:</span> {data.topK || 5}
            </p>
            <p>
              <span className="font-medium">Threshold:</span>{" "}
              {data.scoreThreshold || 0.7}
            </p>
            {data.queryText && (
              <p className="text-gray-600 italic truncate">
                Query: {data.queryText.substring(0, 30)}...
              </p>
            )}
          </>
        ) : (
          <p className="text-gray-500 italic">Not configured</p>
        )}
      </div>
    </BaseNode>
  );
}

