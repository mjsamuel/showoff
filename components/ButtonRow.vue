<template>
  <div class="flex text-sm font-medium">
    <template v-if="gameStarted">
      <SolidButton :class="'h-full w-32'" @click="$emit('nextTurn')">Next turn</SolidButton>
    </template>
    <template v-else>
      <SolidButton :class="'mr-3 h-full w-32'" @click="$emit('startGame', false)">Play</SolidButton>
      <OutlineButton :class="'h-full w-32'" @click="$emit('startGame', true)">+ Modifiers</OutlineButton>
    </template>
  </div>
</template>

<script setup lang="ts">
const props = defineProps(["gameStarted", "buttonWidth"]);
const emit = defineEmits(["startGame", "nextTurn"]);
</script>
