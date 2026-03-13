<script>
  let count = $state(0);
  let { title } = $props();
</script>

<div data-testid="svelte-card" style="border: 1px solid #e0e0e0; border-radius: 12px; padding: 16px; background: #fafafa;">
  <h3 style="font-size: 16px; margin-bottom: 8px;">{title} (Svelte)</h3>
  <p style="color: #444; margin-bottom: 12px; font-size: 14px;">Count: {count}</p>
  <button onclick={() => count++} style="padding: 8px 16px; border: none; border-radius: 8px; background: #e55039; color: white; font-size: 14px; cursor: pointer;">
    Increment
  </button>
</div>
