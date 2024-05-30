<template>
  <TransitionGroup enter-active-class="transition-all duration-300 ease-out transform-gpu"
    enter-from-class="translate-y-full" leave-active-class="transition-opacity duration-300" leave-to-class="opacity-0"
    @before-enter="showModifier = false" @after-enter="onAfterCategoryEnter">
    <div v-for="(card, index) in cards" :key="card.category.key" class="absolute h-full">
      <!-- category card -->
      <div :class="`flex w-160 ${!!card.modifier ? '' : 'justify-center'} h-full items-center`">
        <div
          :class="`h-fit min-h-96 w-80 flex-col rounded-xl border-black bg-gray-100 shadow-xl p-5 ${card.category.rotation < 0 ? '-' : ''}rotate-${Math.abs(card.category.rotation)}`">
          <p class="mb-1 text-3xl font-semibold text-black">
            {{ card.category.name }}
          </p>
          <p class="text-xl font-medium text-black" v-html="card.category.description"></p>
        </div>
        <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="translate-y-full">
          <!-- modifier card -->
          <div v-if="!!card.modifier && (index < cards.length - 1 || showModifier)"
            :class="`h-fit min-h-96 w-80 rounded-xl border-black bg-gray-700 p-5 shadow-xl ${card.modifier.rotation < 0 ? '-' : ''}rotate-${Math.abs(card.modifier.rotation)}`">
            <p class="mb-1 text-3xl font-semibold text-white">
              ...{{ card.modifier.name }}
            </p>
            <p class="text-xl font-medium text-white">
              {{ card.modifier.description }}
            </p>
          </div>
        </Transition>
      </div>
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
