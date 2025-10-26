import React from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";

export function OutputNode({ id, data, selected }: NodeProps) {
  const hasOutput = data.output && Object.keys(data.output).length > 0;

  const handleExportJSON = () => {
    if (!data.output) return;
    
    const jsonStr = JSON.stringify(data.output, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `workflow-output-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderOutputPreview = () => {
    if (!data.output) return null;

    // Check for media outputs
    const hasImage = data.output.imageBase64 || (Array.isArray(data.output) && data.output.some((item: any) => item?.imageBase64));
    const hasAudio = data.output.audioBase64;
    const hasVideo = data.output.videoBase64;
    const isFileArtifact = data.output.dataUrl && data.output.filename;

    if (isFileArtifact) {
      return (
        <div className="text-xs text-gray-500 space-y-2">
          <div className="truncate">📎 {data.output.filename}</div>
          <a
            href={data.output.dataUrl}
            download={data.output.filename}
            className="inline-block px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Download
          </a>
        </div>
      );
    }

    if (hasImage || hasAudio || hasVideo) {
      return (
        <div className="text-xs text-gray-500 space-y-1">
          {hasImage && <div>🖼️ Image output</div>}
          {hasAudio && <div>🔊 Audio output</div>}
          {hasVideo && <div>🎬 Video output</div>}
        </div>
      );
    }

    // Show text preview
    const preview = typeof data.output === 'string' 
      ? data.output 
      : JSON.stringify(data.output).substring(0, 100);
    
    return (
      <pre className="text-xs bg-white/60 dark:bg-white/5 border border-[var(--border)] rounded p-2 max-h-24 overflow-auto whitespace-pre-wrap break-words" title={preview}>
        {preview}
        {preview.length > 100 && '...'}
      </pre>
    );
  };

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      showSource={false}
      icon="📤"
      title="Output"
    >
      {hasOutput ? (
        <div className="space-y-2">
          {renderOutputPreview()}
          <button onClick={handleExportJSON} className="w-full px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors">📥 Export JSON</button>
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic">No output yet</p>
      )}
    </BaseNode>
  );
}

