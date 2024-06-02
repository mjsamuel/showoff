<template>
  <div
    class="relative z-0 m-auto flex h-full w-full justify-center sm:mb-24
      sm:mt-10">
    <TransitionGroup
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="translate-y-full"
      leave-active-class="transition-opacity duration-300"
      leave-to-class="opacity-0"
      @before-enter="onBeforeCategoryEnter"
      @after-enter="onAfterCategoryEnter">
      <div
        v-for="(card, index) in cards"
        :key="card.category.key"
        class="absolute h-full">
        <div
          class="sm:w-160 flex h-full w-full flex-col items-center rounded-t-xl
            bg-gray-100 shadow-xl sm:flex-row sm:bg-transparent sm:shadow-none"
          :class="{ 'sm:justify-center': !card.modifier }">
          <!-- category -->
          <div
            class="h-fit w-96 p-5 sm:static sm:h-fit sm:min-h-96 sm:w-80
              sm:rounded-xl sm:bg-gray-100 sm:shadow-xl"
            :class="`sm:${
              card.category.rotation < 0 ? '-' : ''
            }rotate-${Math.abs(card.category.rotation)}`">
            <p class="mb-1 text-3xl font-semibold text-black">
              {{ card.category.name }}
            </p>
            <p
              class="text-xl font-medium text-black"
              v-html="card.category.description"></p>
          </div>
          <!-- modifier -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="translate-y-full"
            @before-enter="animationCounter++"
            @after-enter="animationCounter--">
            <div
              v-if="card.modifier && (index < cards.length - 1 || showModifier)"
              class="h-full w-96 rounded-t-xl border-black bg-gray-700 p-5
                shadow-xl sm:h-fit sm:min-h-96 sm:w-80 sm:rounded-xl"
              :class="`sm:${
                card.modifier.rotation < 0 ? '-' : ''
              }rotate-${Math.abs(card.modifier.rotation)}`">
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
  </div>
</template>

<script setup lang="ts">
const props = defineProps(['cards'])
const emit = defineEmits([
  'startedAnimating',
  'finishedAnimating',
  'categoryEntered',
])
const showModifier = ref(false)
const animationCounter = ref(0)

function onBeforeCategoryEnter() {
  showModifier.value = false
  animationCounter.value++
}

function onAfterCategoryEnter() {
  showModifier.value = true
  animationCounter.value--
  emit('categoryEntered')
}

watch(
  () => animationCounter.value,
  (count) => {
    if (animationCounter.value > 0) {
      emit('startedAnimating')
    } else if (animationCounter.value === 0) {
      emit('finishedAnimating')
    }
  }
)
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
