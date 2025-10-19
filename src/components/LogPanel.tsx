"use client";

import React, { useEffect, useRef } from "react";
import { useWorkflowStore } from "@/store/workflowStore";

export function LogPanel() {
  const logs = useWorkflowStore((state) => state.logs);
  const clearLogs = useWorkflowStore((state) => state.clearLogs);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "info":
        return "text-blue-600";
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "info":
        return "ℹ️";
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      default:
        return "•";
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  };

  return (
    <div className="h-64 bg-gray-900 text-gray-100 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <h3 className="font-semibold text-sm">Execution Logs</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{logs.length} entries</span>
          {logs.length > 0 && (
            <button
              onClick={clearLogs}
              className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No logs yet. Run a workflow to see execution logs.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-2 py-1 px-2 rounded hover:bg-gray-800/50"
              >
                <span className="text-gray-500">{formatTime(log.timestamp)}</span>
                <span>{getLevelIcon(log.level)}</span>
                {log.nodeId && (
                  <span className="text-purple-400">[{log.nodeId}]</span>
                )}
                <span className={getLevelColor(log.level)}>{log.message}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}

