<template>
  <button
    class="group relative mb-2 me-2 inline-flex w-28 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-green-400 to-blue-600 p-0.5 text-sm font-medium text-gray-900 transition-all duration-75 hover:shadow-lg hover:shadow-cyan-500/50 dark:text-white dark:hover:shadow-lg dark:hover:shadow-cyan-800/80">
    <span class="relative w-28 rounded-md bg-white px-5 py-2.5 transition-all duration-75 ease-in dark:bg-gray-900">
      <slot></slot>
    </span>
  </button>
</template>
