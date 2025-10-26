import React from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";

export function TextToImageNode({ id, data, selected }: NodeProps) {
  // Use resolved prompt from output if available, otherwise use template prompt
  const displayPrompt = data.output?.prompt || data.prompt;
  
  const handleDownload = () => {
    if (!data.output?.imageBase64) return;
    
    const link = document.createElement("a");
    link.href = data.output.imageBase64;
    link.download = `image-${id}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      icon="🎨"
      title="Text to Image"
    >
      {displayPrompt && (
        <p className="text-gray-700 text-sm truncate" title={displayPrompt}>
          <span className="font-medium">Prompt:</span> {displayPrompt.substring(0, 40)}
          {displayPrompt.length > 40 && "..."}
        </p>
      )}
      {data.output?.imageBase64 && (
        <div className="mt-2 space-y-2">
          <img 
            src={data.output.imageBase64} 
            alt="Generated" 
            className="w-full h-20 object-cover rounded border border-gray-300 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={handleDownload}
            title="Click to download"
          />
          <button
            onClick={handleDownload}
            className="w-full px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
          >
            📥 Download Image
          </button>
        </div>
      )}
    </BaseNode>
  );
}

