<template>
  <div class="group absolute inset-0 m-auto h-96 w-80 select-none rounded-lg border-black bg-gray-100 p-6 shadow-xl">
    <span class="text-3xl font-semibold text-black">{{ prompt }}</span>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
defineProps(["prompt", "category-desc", "modifier-desc"]);
const showDetails = ref<boolean>(false);
const card = ref(null);
</script>
