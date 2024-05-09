<template>
  <TransitionGroup enter-active-class="transition-all duration-300 ease-out" enter-from-class="translate-y-full"
    @before-enter="showModifier = false" @after-enter="showModifier = true">
    <div v-for="(card, index) in cards" :key="card.category.key"
      class="z-{{ (index + 1) * 10 }} absolute flex h-full w-full select-none flex-col rounded-t-xl border-black bg-gray-100 shadow-xl">
      <!-- category card -->
      <div class="p-5">
        <p class="text-3xl font-semibold text-black">
          {{ card.category.name }}
        </p>
        <p class="text-lg font-semibold text-black">
          {{ card.category.description }}
        </p>
      </div>
      <!-- modifier card -->
      <Transition enter-active-class="transition-all delay-500 duration-300 ease-out"
        enter-from-class="translate-y-full">
        <div v-if="!!card.modifier && ((index < cards.length - 1) || showModifier)"
          class="flex-grow rounded-t-xl border-black bg-black p-5 shadow-xl">
          <p class="text-3xl font-semibold text-white">
            ...{{ card.modifier.name }}
          </p>
          <p class="text-lg font-semibold text-white">
            {{ card.modifier.description }}
          </p>
        </div>
      </Transition>
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
defineProps(["cards"]);
const showModifier = ref(false);
</script>
