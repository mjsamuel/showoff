<template>
  <div class="flex flex-col items-center justify-center">
    <h1 class="mb-2 grow text-5xl font-extrabold dark:text-white">Showoff</h1>
    <form class="flex w-full flex-col space-y-8 rounded-xl bg-white p-4 shadow-xl">
      <fieldset id="game-type">
        <legend class="mb-2 block text-sm font-medium text-gray-900">
          Game type
        </legend>
        <div class="flex space-x-4">
          <div class="flex items-center">
            <input type="radio" id="gt-standard" name="game-type" value="standard" checked
              class="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600" />
            <label for="gt-standard" class="ms-2 text-sm font-medium text-gray-900">Standard</label>
          </div>
          <div class="flex items-center">
            <input type="radio" id="gt-advanced" name="game-type" value="advanced"
              class="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600" />
            <label for="gt-advanced" class="ms-2 text-sm font-medium text-gray-900">Advanced (with modifiers)</label>
          </div>
        </div>
      </fieldset>

      <div>
        <label for="modifier-chance" class="mb-2 block text-sm font-medium text-gray-900">Modifier Chance</label>
        <input id="modifier-chance" type="range" value="50"
          class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200" />
      </div>
    </form>
  </div>
</template>
