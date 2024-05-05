<template>
  <div
    class="3 absolute bottom-0 left-0 right-0 top-0 m-auto h-96 w-80 rounded-lg border-black bg-gray-100 p-6 shadow"
  >
    <span class="text-3xl font-semibold dark:text-black">{{ prompt }}</span>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
defineProps({ prompt: String });
</script>
