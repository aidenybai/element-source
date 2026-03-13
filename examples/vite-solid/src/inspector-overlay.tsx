import { createSignal, createEffect, onMount, onCleanup } from "solid-js";
import { resolveElementInfo, type ElementInfo } from "element-source";

export const InspectorOverlay = () => {
  const [inspecting, setInspecting] = createSignal(false);
  const [result, setResult] = createSignal<ElementInfo | null>(null);

  const handleClick = async (event: MouseEvent) => {
    if (!inspecting()) return;
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

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown);
    onCleanup(() => document.removeEventListener("keydown", handleKeyDown));
  });

  createEffect(() => {
    if (inspecting()) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  });

  return (
    <div style={{ "margin-top": "24px", "border-top": "1px solid #e0e0e0", "padding-top": "16px" }}>
      <button
        data-testid="inspector-toggle"
        onclick={() => setInspecting((previous) => !previous)}
        style={{
          width: "100%",
          padding: "12px",
          border: "2px solid #4a90d9",
          "border-radius": "10px",
          background: inspecting() ? "#4a90d9" : "white",
          color: inspecting() ? "white" : "#4a90d9",
          "font-size": "15px",
          "font-weight": "600",
          cursor: "pointer",
        }}
      >
        {inspecting() ? "Stop Inspecting" : "Start Inspector"}
      </button>
      {result() && (
        <div
          data-testid="result-panel"
          style={{
            "margin-top": "16px",
            padding: "16px",
            background: "#1a1a2e",
            "border-radius": "10px",
            color: "#e0e0e0",
            "font-size": "13px",
          }}
        >
          <h4 style={{ "margin-bottom": "12px", color: "#8bc6ec", "font-size": "14px" }}>
            Inspection Result
          </h4>
          <div style={{ display: "flex", gap: "8px", "margin-bottom": "6px" }}>
            <span style={{ color: "#888", "min-width": "80px" }}>Tag:</span>
            <code style={{ color: "#a8e6cf", "font-family": "monospace", "font-size": "12px" }}>
              {result()!.tagName}
            </code>
          </div>
          <div style={{ display: "flex", gap: "8px", "margin-bottom": "6px" }}>
            <span style={{ color: "#888", "min-width": "80px" }}>Component:</span>
            <code
              data-testid="component-name"
              style={{ color: "#a8e6cf", "font-family": "monospace", "font-size": "12px" }}
            >
              {result()!.componentName ?? "N/A"}
            </code>
          </div>
          {result()!.source && (
            <div style={{ display: "flex", gap: "8px", "margin-bottom": "6px" }}>
              <span style={{ color: "#888", "min-width": "80px" }}>File:</span>
              <code
                data-testid="filepath"
                style={{
                  color: "#a8e6cf",
                  "font-family": "monospace",
                  "font-size": "12px",
                  "word-break": "break-all",
                }}
              >
                {result()!.source!.filePath}
              </code>
            </div>
          )}
          {result()!.source && (
            <div style={{ display: "flex", gap: "8px", "margin-bottom": "6px" }}>
              <span style={{ color: "#888", "min-width": "80px" }}>Line:</span>
              <code style={{ color: "#a8e6cf", "font-family": "monospace", "font-size": "12px" }}>
                {result()!.source!.lineNumber}:{result()!.source!.columnNumber}
              </code>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
