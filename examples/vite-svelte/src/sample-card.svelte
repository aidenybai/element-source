<script lang="ts">
  interface Props {
    title: string;
  }

  let { title }: Props = $props();
  let count = $state(0);
</script>

<div class="card" data-testid="sample-card">
  <h3>{title}</h3>
  <p>Count: {count}</p>
  <button onclick={() => count++}>Increment</button>
</div>

<style>
  .card {
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 16px;
    background: #fafafa;
  }

  h3 {
    font-size: 16px;
    margin-bottom: 8px;
  }

  p {
    color: #444;
    margin-bottom: 12px;
    font-size: 14px;
  }

  button {
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    background: #e55039;
    color: white;
    font-size: 14px;
    cursor: pointer;
  }
</style>
