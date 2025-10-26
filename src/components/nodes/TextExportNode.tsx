import React from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";

export function TextExportNode({ id, data, selected }: NodeProps) {
  const format = data.format || "pdf";
  const filename = data.filename || (format === "csv" ? "summary.csv" : "summary.pdf");

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      icon={format === "csv" ? "🧾" : "📄"}
      title="Text Export"
    >
      <p className="text-gray-700 text-sm">
        <span className="font-medium">Format:</span> {format.toUpperCase()}
      </p>
      <p className="text-gray-700 text-sm truncate" title={filename}>
        <span className="font-medium">Filename:</span> {filename}
      </p>
      {data.output?.dataUrl && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <a
            href={data.output.dataUrl}
            download={data.output.filename || filename}
            className="text-xs text-blue-600 hover:underline"
          >
            Download latest export
          </a>
        </div>
      )}
    </BaseNode>
  );
}



