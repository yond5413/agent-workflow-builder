import React from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";

export function WebScraperNode({ id, data, selected }: NodeProps) {
  const hasOutput = data.output && typeof data.output === 'string';
  const contentPreview = hasOutput ? data.output.substring(0, 80) : null;

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      icon="🌐"
      title="Web Scraper"
    >
      {data.url && (
        <p className="text-gray-700 text-sm truncate" title={data.url}>
          <span className="font-medium">URL:</span> {data.url}
        </p>
      )}
      {data.max_length && (
        <p className="text-gray-600 text-sm">
          <span className="font-medium">Max Length:</span> {data.max_length}
        </p>
      )}
      {contentPreview && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-green-600 truncate" title={data.output}>
            <span className="font-medium">✓ Scraped:</span> {contentPreview}
            {data.output.length > 80 && "..."}
          </p>
        </div>
      )}
    </BaseNode>
  );
}

