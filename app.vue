<template>
  <Transition enter-active-class="transition-opacity duration-300 ease-out"
    leave-active-class="transition-opacity duration-200" enter-from-class="opacity-0 " leave-to-class="opacity-0">
    <RulesModal v-if="showRules" @close-modal="showRules = false"></RulesModal>
  </Transition>

  <main class="sm:flex sm:justify-center ">
    <div class="h-[calc(100dvh)] sm:w-[80%] lg:w-[50%]">
      <NuxtPage @show-rules="showRules = true" />
    </div>
  </main>
</template>

<script setup lang="ts">
useHead({
  title: "Showoff",
  bodyAttrs: { class: "bg-white dark:bg-gray-900" },
});

const showRules = ref(false);

onMounted(() => {
  document.addEventListener("keydown", (event) => {
    if (event.key === "?") {
      showRules.value = !showRules.value;
    } else if (event.key === "Escape") {
      showRules.value = false;
    }
  });
});
</script>

<style lang="postcss">
* {
  @apply touch-manipulation;
}
</style>
