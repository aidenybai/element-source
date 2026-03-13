"use client";

import { useCallback, useEffect, useState } from "react";
import { resolveElementInfo } from "element-source";

interface InspectionResult {
  tagName: string;
  componentName: string | null;
  filePath: string | null;
  lineNumber: number | null;
  stackLength: number;
}

export const InspectorOverlay = () => {
  const [inspecting, setInspecting] = useState(false);
  const [result, setResult] = useState<InspectionResult | null>(null);

  const handleDocumentClick = useCallback(
    async (event: MouseEvent) => {
      if (!inspecting) return;

      event.preventDefault();
      event.stopPropagation();

      const target = event.target;
      if (!(target instanceof Element)) return;

      const info = await resolveElementInfo(target);
      setResult({
        tagName: info.tagName,
        componentName: info.componentName,
        filePath: info.source?.filePath ?? null,
        lineNumber: info.source?.lineNumber ?? null,
        stackLength: info.stack.length,
      });
    },
    [inspecting],
  );

  useEffect(() => {
    if (!inspecting) return;
    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, [inspecting, handleDocumentClick]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setInspecting(false);
        setResult(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      data-testid="inspector-overlay"
      style={{
        marginTop: 24,
        borderTop: "1px solid #e0e0e0",
        paddingTop: 16,
      }}
    >
      <button
        type="button"
        data-testid="inspector-toggle"
        onClick={() => {
          setInspecting((previous) => !previous);
          if (inspecting) setResult(null);
        }}
        style={{
          width: "100%",
          padding: 12,
          border: "2px solid #4a90d9",
          borderRadius: 10,
          background: inspecting ? "#4a90d9" : "white",
          color: inspecting ? "white" : "#4a90d9",
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {inspecting ? "Stop Inspecting" : "Start Inspector"}
      </button>

      {result && (
        <div
          data-testid="result-panel"
          style={{
            marginTop: 16,
            padding: 16,
            background: "#1a1a2e",
            borderRadius: 10,
            color: "#e0e0e0",
            fontSize: 13,
          }}
        >
          <h4 style={{ marginBottom: 12, color: "#8bc6ec", fontSize: 14 }}>Inspection Result</h4>
          <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
            <span style={{ color: "#888", minWidth: 80 }}>Tag:</span>
            <code style={{ color: "#a8e6cf", fontFamily: "monospace" }}>{result.tagName}</code>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
            <span style={{ color: "#888", minWidth: 80 }}>Component:</span>
            <code data-testid="component-name" style={{ color: "#a8e6cf", fontFamily: "monospace" }}>
              {result.componentName ?? "N/A"}
            </code>
          </div>
          {result.filePath && (
            <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <span style={{ color: "#888", minWidth: 80 }}>File:</span>
              <code
                data-testid="filepath"
                style={{
                  color: "#a8e6cf",
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                }}
              >
                {result.filePath}
              </code>
            </div>
          )}
          {result.lineNumber !== null && (
            <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <span style={{ color: "#888", minWidth: 80 }}>Line:</span>
              <code style={{ color: "#a8e6cf", fontFamily: "monospace" }}>{result.lineNumber}</code>
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ color: "#888", minWidth: 80 }}>Stack depth:</span>
            <code style={{ color: "#a8e6cf", fontFamily: "monospace" }}>{result.stackLength}</code>
          </div>
        </div>
      )}
    </div>
  );
};
