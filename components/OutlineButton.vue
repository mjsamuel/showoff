<template>
  <button
    class="inline-flex overflow-hidden rounded-lg bg-gradient-to-br from-green-400 to-blue-600 p-0.5 text-gray-900 dark:text-white">
    <div class="flex h-full w-full rounded-md bg-white dark:bg-gray-900">
      <span class="m-auto">
        <slot class="m-auto"></slot>
      </span>
    </div>
  </button>
</template>
