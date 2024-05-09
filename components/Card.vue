<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="translate-y-full"
    @after-enter="showModifier = true"
  >
    <div
      v-if="category"
      class="flex h-full w-full select-none flex-col rounded-t-xl border-black bg-gray-100 shadow-xl"
    >
      <!-- category card -->
      <div class="p-5">
        <p class="text-3xl font-semibold text-black">{{ category.name }}</p>
        <p class="text-lg font-semibold text-black">
          {{ category.description }}
        </p>
      </div>
      <!-- modifier card -->
      <Transition
        enter-active-class="transition-all delay-75 duration-300 ease-out"
        enter-from-class="translate-y-full"
      >
        <div
          v-if="showModifier && modifier"
          class="flex-grow rounded-t-xl border-black bg-black p-5 shadow-xl"
        >
          <p class="text-3xl font-semibold text-white">{{ modifier.name }}</p>
          <p class="text-lg font-semibold text-white">
            {{ modifier.description }}
          </p>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
defineProps(["category", "modifier"]);
const showModifier = ref(false);
</script>
