<template>
  <div class="group relative flex h-full w-full select-none flex-col rounded-t-xl border-black bg-gray-100 shadow-xl">
    <!-- category card -->
    <div class="p-5">
      <p class="text-3xl font-semibold text-black">{{ category.name }}</p>
      <p class="text-lg font-semibold text-black">{{ category.description }}</p>
    </div>
    <!-- modifier card -->
    <div v-if="modifier" class="w-full flex-grow rounded-t-xl shadow-t-xl border-black bg-black px-5 pt-5">
      <p class="text-3xl font-semibold text-white">{{ modifier.name }}</p>
      <p class="text-lg font-semibold text-white">{{ modifier.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
defineProps(["category", "modifier"]);
</script>
