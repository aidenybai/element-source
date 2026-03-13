<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{ title: string }>();
const count = ref(0);
</script>

<template>
  <div class="card" data-testid="sample-card">
    <h3>{{ props.title }}</h3>
    <p>Count: {{ count }}</p>
    <button @click="count++">Increment</button>
  </div>
</template>

<style scoped>
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
  background: #4a90d9;
  color: white;
  font-size: 14px;
  cursor: pointer;
}
</style>
