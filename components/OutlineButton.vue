<template>
  <button
    class="group inline-flex overflow-hidden rounded-lg bg-gradient-to-br
      from-green-400 to-blue-600 p-0.5 text-gray-900 transition-all duration-75
      hover:shadow-lg hover:shadow-cyan-500/50 dark:text-white
      dark:hover:shadow-lg dark:hover:shadow-cyan-800/80">
    <div class="flex h-full w-full rounded-md bg-white dark:bg-gray-900">
      <span class="m-auto">
        <slot class="m-auto"></slot>
      </span>
    </div>
  </button>
</template>
