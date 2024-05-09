<template>
  <TransitionGroup enter-active-class="transition-all duration-300 ease-out" enter-from-class="translate-y-full"
    @before-enter="showModifier = false" @after-enter="onAfterCategoryEnter">
    <div v-for="(card, index) in cards" :key="card.category.key"
      class="absolute flex h-full w-full select-none flex-col rounded-t-xl border-black bg-gray-100 shadow-xl">
      <!-- category card -->
      <div class="p-5">
        <p class="mb-1 text-2xl font-semibold text-black sm:text-3xl">
          {{ card.category.name }}
        </p>
        <p class="sm:text-xl font-semibold text-black" v-html="card.category.description"></p>
      </div>
      <!-- modifier card -->
      <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="translate-y-full">
        <div v-if="!!card.modifier && (index < cards.length - 1 || showModifier)"
          class="flex-grow rounded-t-xl border-black bg-black p-5 shadow-xl">
          <p class="mb-1 text-2xl font-semibold text-white sm:text-3xl">
            ...{{ card.modifier.name }}
          </p>
          <p class="font-semibold text-white sm:text-xl">
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

<style>
ol {
  @apply list-inside list-decimal;
}

ul {
  @apply list-inside list-disc;
}

i {
  @apply italic;
}
</style>
