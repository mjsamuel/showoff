<template>
  <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="fixed inset-0 bg-gray-900 bg-opacity-75"></div>

    <div class="fixed inset-0 z-50 w-screen overflow-y-auto">
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
        @click.self="$emit('closeModal')">
        <div
          class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <!-- content -->
          <div class="relative rounded-lg bg-white shadow dark:bg-gray-700" tabindex="0">
            <!-- Modal header -->
            <div class="flex items-center justify-between rounded-t border-b p-4 md:p-5 dark:border-gray-600">
              <h2 class="text-4xl font-bold dark:text-white">Rules</h2>
              <button type="button" @click="$emit('closeModal')"
                class="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
                data-modal-hide="default-modal">
                <svg class="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 14 14">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
                <span class="sr-only">Close modal</span>
              </button>
            </div>
            <!-- Modal body -->
            <div class="space-y-4 p-4">
              <div class="text-base leading-relaxed text-black dark:text-gray-300">
                <MDC :value="rules" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import rules from "./assets/rules.md?raw";
</script>

<style lang="postcss" scoped>
:deep(h1) {
  @apply mb-2 mt-4 text-2xl font-bold dark:text-white;
}

:deep(ol),
:deep(ul) {
  @apply ml-6 list-outside;
}

:deep(ol) {
  @apply list-outside list-decimal;
}

:deep(ul) {
  @apply list-outside list-disc;
}

:deep(li ol),
:deep(li ul) {
  @apply ml-10;
}

:deep(i) {
  @apply italic;
}

:deep(a) {
  @apply text-blue-600 hover:underline dark:text-blue-500;
}
</style>
