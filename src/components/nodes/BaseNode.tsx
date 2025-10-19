import React from "react";
import { Handle, Position } from "reactflow";
import { NodeExecutionState } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflowStore";

interface BaseNodeProps {
  id: string;
  data: any;
  selected?: boolean;
  sourcePosition?: Position;
  targetPosition?: Position;
  showSource?: boolean;
  showTarget?: boolean;
  icon: string;
  title: string;
  children?: React.ReactNode;
}

export function BaseNode({
  id,
  data,
  selected,
  sourcePosition = Position.Right,
  targetPosition = Position.Left,
  showSource = true,
  showTarget = true,
  icon,
  title,
  children,
}: BaseNodeProps) {
  const nodeExecutionStates = useWorkflowStore((state) => state.nodeExecutionStates);
  const executionState = nodeExecutionStates.get(id) || NodeExecutionState.IDLE;

  const stateColors = {
    [NodeExecutionState.IDLE]: "bg-gray-100 border-gray-300",
    [NodeExecutionState.RUNNING]: "bg-blue-100 border-blue-500 animate-pulse",
    [NodeExecutionState.SUCCESS]: "bg-green-100 border-green-500",
    [NodeExecutionState.ERROR]: "bg-red-100 border-red-500",
  };

  const stateDotColors = {
    [NodeExecutionState.IDLE]: "bg-gray-400",
    [NodeExecutionState.RUNNING]: "bg-blue-500",
    [NodeExecutionState.SUCCESS]: "bg-green-500",
    [NodeExecutionState.ERROR]: "bg-red-500",
  };

  return (
    <div
      className={`
        relative rounded-lg border-2 p-4 min-w-[200px] max-w-[300px]
        ${stateColors[executionState]}
        ${selected ? "ring-2 ring-blue-400" : ""}
        transition-all shadow-md
      `}
    >
      {showTarget && (
        <Handle
          type="target"
          position={targetPosition}
          className="w-3 h-3 !bg-blue-500"
        />
      )}

      <div className="flex items-start gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm truncate">{title}</h3>
            <div
              className={`w-2 h-2 rounded-full ${stateDotColors[executionState]}`}
              title={executionState}
            />
          </div>
          {data.label && (
            <p className="text-xs text-gray-600 truncate">{data.label}</p>
          )}
        </div>
      </div>

      {children && <div className="text-xs space-y-1">{children}</div>}

      {data.output && (
        <div className="mt-2 pt-2 border-t border-gray-300">
          <p className="text-xs text-gray-500 mb-1">Output:</p>
          <pre className="text-xs bg-gray-50 p-2 rounded overflow-hidden text-ellipsis max-h-20">
            {typeof data.output === "string"
              ? data.output.substring(0, 100)
              : JSON.stringify(data.output, null, 2).substring(0, 100)}
            {(typeof data.output === "string" ? data.output.length : JSON.stringify(data.output).length) > 100 && "..."}
          </pre>
        </div>
      )}

      {showSource && (
        <Handle
          type="source"
          position={sourcePosition}
          className="w-3 h-3 !bg-blue-500"
        />
      )}
    </div>
  );
}

