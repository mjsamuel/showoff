<template>
  <div
    class="relative z-0 h-full w-full flex justify-center"
    :class="{ 'overflow-y-hidden sm:overflow-y-clip': animationCounter > 0 }">
    <TransitionGroup
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="translate-y-full"
      leave-active-class="transition-opacity duration-300"
      leave-to-class="opacity-0"
      @before-enter="onBeforeCategoryEnter"
      @after-enter="onAfterCategoryEnter">
      <div
        v-for="(card, index) in cards"
        :key="card.turn"
        :data-card-index="card.turn"
        class="absolute h-full sm:w-full w-fit flex justify-center">
        <div
          class="sm:w-160 flex h-full w-full flex-col items-center rounded-t-xl
            bg-gray-100 shadow-xl sm:flex-row sm:bg-transparent sm:shadow-none"
          :class="{ 'sm:justify-center': !card.modifier }">
          <!-- category -->
          <div
            class="h-fit w-96 p-5 sm:static sm:h-fit sm:min-h-96 sm:w-80
              sm:rounded-xl sm:bg-gray-100 sm:shadow-xl"
            :class="getRotationClass(card.category.rotation)">
            <p class="mb-1 text-3xl font-semibold text-black">
              {{ card.category.name }}
            </p>
            <p
              class="text-xl font-medium text-black"
              v-html="card.category.description"></p>
          </div>
          <!-- modifier -->
          <div
            v-if="card.modifier"
            class="h-full w-96 rounded-t-xl border-black bg-gray-700 p-5
              shadow-xl sm:h-fit sm:min-h-96 sm:w-80 sm:rounded-xl
              transition-transform ease-out"
            :class="[
              {
                'translate-y-[150%]':
                  !showModifier && index === cards.length - 1,
              },
              'duration-' + DURATION_PER_CARD,
              getRotationClass(card.modifier.rotation),
            ]">
            <p class="mb-1 text-3xl font-semibold text-white">
              ...{{ card.modifier.name }}
            </p>
            <p class="text-xl font-medium text-white">
              {{ card.modifier.description }}
            </p>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const props = defineProps(['cards']);
const emit = defineEmits(['categoryEntered']);
const showModifier = ref<boolean>(false);
const animationCounter = ref<number>(0);
const DURATION_PER_CARD = 300;
defineExpose({ showModifier });

function onBeforeCategoryEnter() {
  showModifier.value = false;
  animationCounter.value++;
}

function onAfterCategoryEnter(el) {
  emit('categoryEntered');
  const index = Number(el.getAttribute('data-card-index'));
  const card = props.cards.find((c) =>  c.turn === index);
  if (!card.modifier) {
    animationCounter.value--;
    return;
  }
  showModifier.value = true;
  setTimeout(() => {
    animationCounter.value--;
  }, DURATION_PER_CARD);
}

function getRotationClass(rotation: number): string {
  return `sm:${rotation < 0 ? '-' : ''}rotate-${Math.abs(rotation)}`;
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
