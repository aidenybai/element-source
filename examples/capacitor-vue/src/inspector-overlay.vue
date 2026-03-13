<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
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

const inspecting = ref(false);
const result = ref<InspectionResult | null>(null);

const handleClick = async (event: MouseEvent) => {
  if (!inspecting.value) return;

  event.preventDefault();
  event.stopPropagation();

  const target = event.target;
  if (!(target instanceof Element)) return;

  const info = await resolveElementInfo(target);
  result.value = {
    tagName: info.tagName,
    componentName: info.componentName,
    source: info.source,
    stackLength: info.stack.length,
  };
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    inspecting.value = false;
    result.value = null;
  }
};

watch(inspecting, (isInspecting) => {
  if (isInspecting) {
    document.addEventListener("click", handleClick, true);
  } else {
    document.removeEventListener("click", handleClick, true);
  }
});

onMounted(() => {
  document.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
  if (inspecting.value) {
    document.removeEventListener("click", handleClick, true);
  }
});
</script>

<template>
  <div class="inspector-controls">
    <button
      class="toggle-btn"
      :class="{ active: inspecting }"
      data-testid="inspector-toggle"
      @click="inspecting = !inspecting"
    >
      {{ inspecting ? "Stop Inspecting" : "Start Inspector" }}
    </button>

    <div v-if="result" class="result-panel" data-testid="result-panel">
      <h4>Inspection Result</h4>
      <div class="result-row">
        <span class="label">Tag:</span>
        <code>{{ result.tagName }}</code>
      </div>
      <div class="result-row">
        <span class="label">Component:</span>
        <code data-testid="component-name">{{ result.componentName ?? "N/A" }}</code>
      </div>
      <div v-if="result.source" class="result-row">
        <span class="label">File:</span>
        <code class="filepath" data-testid="filepath">{{ result.source.filePath }}</code>
      </div>
      <div v-if="result.source" class="result-row">
        <span class="label">Line:</span>
        <code>{{ result.source.lineNumber }}:{{ result.source.columnNumber }}</code>
      </div>
      <div class="result-row">
        <span class="label">Stack depth:</span>
        <code>{{ result.stackLength }}</code>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  color: #8bc6ec;
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
  color: #a8e6cf;
  font-family: "SF Mono", monospace;
  font-size: 12px;
}

.filepath {
  word-break: break-all;
}
</style>
