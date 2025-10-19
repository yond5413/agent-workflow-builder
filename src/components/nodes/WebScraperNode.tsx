import React from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";

export function WebScraperNode({ id, data, selected }: NodeProps) {
  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      icon="🌐"
      title="Web Scraper"
    >
      {data.url && (
        <p className="text-gray-700 truncate" title={data.url}>
          <span className="font-medium">URL:</span> {data.url}
        </p>
      )}
      {data.max_length && (
        <p className="text-gray-600">
          <span className="font-medium">Max Length:</span> {data.max_length}
        </p>
      )}
    </BaseNode>
  );
}

