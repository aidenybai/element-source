import { useState, useEffect } from "react";
import { resolveElementInfo, type ElementInfo } from "element-source";

export const InspectorOverlay = () => {
  const [inspecting, setInspecting] = useState(false);
  const [result, setResult] = useState<ElementInfo | null>(null);

  const handleClick = async (event: MouseEvent) => {
    if (!inspecting) return;
    event.preventDefault();
    event.stopPropagation();
    const target = event.target;
    if (!(target instanceof Element)) return;
    const info = await resolveElementInfo(target);
    setResult(info);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setInspecting(false);
      setResult(null);
    }
  };

  useEffect(() => {
    if (inspecting) {
      document.addEventListener("click", handleClick);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [inspecting]);

  return (
    <div style={{ marginTop: 24, borderTop: "1px solid #e0e0e0", paddingTop: 16 }}>
      <button
        data-testid="inspector-toggle"
        onClick={() => setInspecting((prev) => !prev)}
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
            <code style={{ color: "#a8e6cf", fontFamily: "monospace", fontSize: 12 }}>
              {result.tagName}
            </code>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
            <span style={{ color: "#888", minWidth: 80 }}>Component:</span>
            <code
              data-testid="component-name"
              style={{ color: "#a8e6cf", fontFamily: "monospace", fontSize: 12 }}
            >
              {result.componentName ?? "N/A"}
            </code>
          </div>
          {result.source && (
            <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <span style={{ color: "#888", minWidth: 80 }}>File:</span>
              <code
                data-testid="filepath"
                style={{
                  color: "#a8e6cf",
                  fontFamily: "monospace",
                  fontSize: 12,
                  wordBreak: "break-all",
                }}
              >
                {result.source.filePath}
              </code>
            </div>
          )}
          {result.source && (
            <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <span style={{ color: "#888", minWidth: 80 }}>Line:</span>
              <code style={{ color: "#a8e6cf", fontFamily: "monospace", fontSize: 12 }}>
                {result.source.lineNumber}:{result.source.columnNumber}
              </code>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
