<template>
  <TransitionGroup enter-active-class="transition-all duration-300 ease-out" enter-from-class="translate-y-full"
    @before-enter="showModifier = false" @after-enter="onAfterCategoryEnter">
    <div v-for="(card, index) in cards" :key="card.category.key"
      class="absolute flex max-h-fit min-h-full w-full flex-col rounded-t-xl border-black bg-gray-100 shadow-xl">
      <!-- category card -->
      <div class="p-5">
        <p class="mb-1 text-3xl font-semibold text-black">
          {{ card.category.name }}
        </p>
        <p class="text-xl font-medium text-black" v-html="card.category.description"></p>
      </div>
      <!-- modifier card -->
      <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="translate-y-full">
        <div v-if="!!card.modifier && (index < cards.length - 1 || showModifier)"
          class="flex-grow rounded-t-xl border-black bg-gray-700 p-5 pb-20 shadow-xl">
          <p class="mb-1 text-3xl font-semibold text-white">
            ...{{ card.modifier.name }}
          </p>
          <p class="text-xl font-medium text-white">
            {{ card.modifier.description }}
          </p>
        </div>
      </Transition>
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
const props = defineProps(["cards"]);
const emit = defineEmits(["categoryEntered"]);
const showModifier = ref(false);

function onAfterCategoryEnter() {
  showModifier.value = true;
  emit("categoryEntered");
}
</script>

<style lang="postcss" scoped>
:deep(ol) {
  @apply list-inside list-decimal;
}

:deep(ul) {
  @apply list-inside list-disc;
}

:deep(i) {
  @apply italic;
}
</style>
