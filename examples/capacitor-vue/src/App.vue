<script setup lang="ts">
import InspectorOverlay from "./inspector-overlay.vue";
import SampleCard from "./sample-card.vue";
</script>

<template>
  <div class="app">
    <h1>Element Source - Vue + Capacitor</h1>
    <p class="subtitle">Tap any element to inspect its source</p>

    <div class="card-grid">
      <SampleCard title="Counter" />
      <SampleCard title="Timer" />
      <SampleCard title="Toggle" />
    </div>

    <InspectorOverlay />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  padding: 24px;
  max-width: 480px;
  margin: 0 auto;
}

h1 {
  font-size: 20px;
  margin-bottom: 4px;
}

.subtitle {
  color: #666;
  margin-bottom: 24px;
  font-size: 14px;
}

.card-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
