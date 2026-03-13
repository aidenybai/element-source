<script lang="ts">
  import SampleCard from "./sample-card.svelte";
  import InspectorOverlay from "./inspector-overlay.svelte";
</script>

<div class="app">
  <h1>Element Source - Vite + Svelte</h1>

  <div class="card-grid">
    <SampleCard title="Counter" />
    <SampleCard title="Timer" />
    <SampleCard title="Toggle" />
  </div>

  <InspectorOverlay />
</div>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .app {
    font-family: system-ui, -apple-system, sans-serif;
    padding: 24px;
    max-width: 480px;
    margin: 0 auto;
  }

  h1 {
    font-size: 20px;
    margin-bottom: 24px;
  }

  .card-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
</style>
