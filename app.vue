<template>
  <Transition enter-active-class="transition-opacity duration-300 ease-out"
    leave-active-class="transition-opacity duration-200" enter-from-class="opacity-0 " leave-to-class="opacity-0">
    <RulesModal v-if="showRules" @close-modal="showRules = false"></RulesModal>
  </Transition>

  <main class="sm:flex sm:justify-center">
    <NuxtPage />
  </main>
</template>

<script setup lang="ts">
useHead({
  title: "Showoff",
  bodyAttrs: { class: "bg-white dark:bg-gray-900" },
});
</script>
