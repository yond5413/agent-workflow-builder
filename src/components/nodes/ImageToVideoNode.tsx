import React from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";

export function ImageToVideoNode({ id, data, selected }: NodeProps) {
  const imageCount = data.images?.length || data.output?.imageCount || 0;
  const hasAudio = !!data.audioBase64 || !!data.output?.hasAudio;

  const handleDownload = () => {
    if (!data.output?.videoBase64) return;
    
    const link = document.createElement("a");
    link.href = data.output.videoBase64;
    link.download = `video-${id}-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      icon="🎬"
      title="Image to Video"
    >
      <p className="text-gray-600 text-sm">
        <span className="font-medium">Images:</span> {imageCount}
      </p>
      <p className="text-gray-600 text-sm">
        <span className="font-medium">Audio:</span> {hasAudio ? "Yes" : "No"}
      </p>
      {data.duration && (
        <p className="text-gray-600 text-sm">
          <span className="font-medium">Duration/Image:</span> {data.duration}s
        </p>
      )}
      {data.output?.videoBase64 && (
        <div className="mt-2 space-y-2">
          <video 
            controls 
            className="w-full rounded border border-gray-300"
            style={{ maxHeight: "120px" }}
          >
            <source src={data.output.videoBase64} type="video/mp4" />
            Your browser does not support the video element.
          </video>
          <button
            onClick={handleDownload}
            className="w-full px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
          >
            📥 Download Video
          </button>
        </div>
      )}
    </BaseNode>
  );
}

