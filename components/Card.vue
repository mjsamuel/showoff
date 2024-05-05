<template>
  <div class="group absolute inset-0 m-auto h-96 w-80 select-none">
    <div @click="showDetails = !!prompt && !showDetails" :class="showDetails
        ? 'transition-all duration-500 [backface-visibility:hidden] [transform:rotateY(180deg)]'
        : 'transition-all duration-500 [transform:rotateY(0deg)]'
      " class="relative h-full w-full rounded-lg border-black bg-gray-100 shadow-xl [transform-style:preserve-3d]">
      <div class="absolute inset-0 p-6">
        <span class="text-3xl font-semibold text-black">{{ prompt }}</span>
        <!-- <span v-if="prompt" class="absolute bottom-0 right-0 text-xl">?</span> -->
      </div>
      <div
        class="absolute inset-0 h-full w-full rounded-lg border-black bg-gray-100 p-4 shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
        <p>
          <template v-if="modifierDesc">
            <strong>Category</strong><br />
          </template>
          <span>{{ categoryDesc }}</span>
        </p>
        <p v-if="modifierDesc" class="mt-2 overflow-hidden text-ellipsis">
          <strong>Modifier</strong><br />
          <span>{{ modifierDesc }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
defineProps(["prompt", "category-desc", "modifier-desc"]);
const showDetails = ref<boolean>(false);
</script>
