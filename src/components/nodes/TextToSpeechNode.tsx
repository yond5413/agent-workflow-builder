import React from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";

export function TextToSpeechNode({ id, data, selected }: NodeProps) {
  // Use resolved text from output if available, otherwise use template text
  const displayText = data.output?.text || data.text;
  
  const handleDownload = () => {
    if (!data.output?.audioBase64) return;
    
    const link = document.createElement("a");
    link.href = data.output.audioBase64;
    link.download = `audio-${id}-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      icon="🔊"
      title="Text to Speech"
    >
      {data.voiceId && (
        <p className="text-gray-600 text-sm">
          <span className="font-medium">Voice:</span> {data.voiceId.substring(0, 15)}...
        </p>
      )}
      {displayText && (
        <p className="text-gray-700 text-sm truncate" title={displayText}>
          <span className="font-medium">Text:</span> {displayText.substring(0, 40)}
          {displayText.length > 40 && "..."}
        </p>
      )}
      {data.output?.audioBase64 && (
        <div className="mt-2 space-y-2">
          <audio 
            controls 
            className="w-full h-8"
            style={{ maxHeight: "32px" }}
          >
            <source src={data.output.audioBase64} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          <button
            onClick={handleDownload}
            className="w-full px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
          >
            📥 Download Audio
          </button>
        </div>
      )}
    </BaseNode>
  );
}

