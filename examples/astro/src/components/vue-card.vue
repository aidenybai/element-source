<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{ title: string }>();
const count = ref(0);
</script>

<template>
  <div data-testid="vue-card" style="border: 1px solid #e0e0e0; border-radius: 12px; padding: 16px; background: #fafafa;">
    <h3 style="font-size: 16px; margin-bottom: 8px;">{{ props.title }} (Vue)</h3>
    <p style="color: #444; margin-bottom: 12px; font-size: 14px;">Count: {{ count }}</p>
    <button @click="count++" style="padding: 8px 16px; border: none; border-radius: 8px; background: #4a90d9; color: white; font-size: 14px; cursor: pointer;">
      Increment
    </button>
  </div>
</template>
