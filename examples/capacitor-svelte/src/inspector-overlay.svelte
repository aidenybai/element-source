<script lang="ts">
  import { resolveElementInfo } from "element-source";

  interface InspectionResult {
    tagName: string;
    componentName: string | null;
    source: {
      filePath: string;
      lineNumber: number | null;
      columnNumber: number | null;
    } | null;
    stackLength: number;
  }

  let inspecting = $state(false);
  let result = $state<InspectionResult | null>(null);

  const handleClick = async (event: MouseEvent) => {
    if (!inspecting) return;

    event.preventDefault();
    event.stopPropagation();

    const target = event.target;
    if (!(target instanceof Element)) return;

    const info = await resolveElementInfo(target);
    result = {
      tagName: info.tagName,
      componentName: info.componentName,
      source: info.source,
      stackLength: info.stack.length,
    };
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      inspecting = false;
      result = null;
    }
  };
</script>

<svelte:document onclick={handleClick} onkeydown={handleKeyDown} />

<div class="inspector-controls">
  <button
    class="toggle-btn"
    class:active={inspecting}
    data-testid="inspector-toggle"
    onclick={() => (inspecting = !inspecting)}
  >
    {inspecting ? "Stop Inspecting" : "Start Inspector"}
  </button>

  {#if result}
    <div class="result-panel" data-testid="result-panel">
      <h4>Inspection Result</h4>
      <div class="result-row">
        <span class="label">Tag:</span>
        <code>{result.tagName}</code>
      </div>
      <div class="result-row">
        <span class="label">Component:</span>
        <code data-testid="component-name">{result.componentName ?? "N/A"}</code>
      </div>
      {#if result.source}
        <div class="result-row">
          <span class="label">File:</span>
          <code class="filepath" data-testid="filepath">{result.source.filePath}</code>
        </div>
        <div class="result-row">
          <span class="label">Line:</span>
          <code>{result.source.lineNumber}:{result.source.columnNumber}</code>
        </div>
      {/if}
      <div class="result-row">
        <span class="label">Stack depth:</span>
        <code>{result.stackLength}</code>
      </div>
    </div>
  {/if}
</div>

<style>
  .inspector-controls {
    margin-top: 24px;
    border-top: 1px solid #e0e0e0;
    padding-top: 16px;
  }

  .toggle-btn {
    width: 100%;
    padding: 12px;
    border: 2px solid #4a90d9;
    border-radius: 10px;
    background: white;
    color: #4a90d9;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
  }

  .toggle-btn.active {
    background: #4a90d9;
    color: white;
  }

  .result-panel {
    margin-top: 16px;
    padding: 16px;
    background: #1a1a2e;
    border-radius: 10px;
    color: #e0e0e0;
    font-size: 13px;
  }

  h4 {
    margin-bottom: 12px;
    color: #4a90d9;
    font-size: 14px;
  }

  .result-row {
    display: flex;
    gap: 8px;
    margin-bottom: 6px;
    align-items: baseline;
  }

  .label {
    color: #888;
    min-width: 80px;
    flex-shrink: 0;
  }

  code {
    color: #ffeaa7;
    font-family: "SF Mono", monospace;
    font-size: 12px;
  }

  .filepath {
    word-break: break-all;
  }
</style>
