<template>
  <div class="flex h-screen items-center">
    <div class="mb-36 flex w-full flex-col items-center">
      <h1 class="text-5xl font-extrabold dark:text-white">Showoff</h1>
      <h2 class="mb-4">
        <button class="font-semibold text-gray-900 underline decoration-blue-600 dark:text-white"
          @click="$emit('showRules')">
          How to play
        </button>
      </h2>
      <form class="flex w-[80%] flex-col space-y-8 rounded-xl bg-white p-6 shadow-xl">
        <fieldset id="game-type">
          <legend class="mb-2 block text-sm font-medium text-gray-900">
            Game type:
          </legend>
          <div class="flex space-x-4">
            <div class="flex items-center">
              <input type="radio" id="gt-standard" name="game-type" value="standard" v-model="gameType"
                class="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600" />
              <label for="gt-standard" class="ms-2 text-sm font-medium text-gray-900">Standard</label>
            </div>
            <div class="flex items-center">
              <input type="radio" id="gt-advanced" name="game-type" value="advanced" v-model="gameType"
                class="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600" />
              <label for="gt-advanced" class="ms-2 text-sm font-medium text-gray-900">Advanced (with modifiers)</label>
            </div>
          </div>
        </fieldset>

        <div>
          <label for="modifier-chance" class="mb-2 block text-sm font-medium text-gray-900">
            Modifier probability: {{ modifierProb }}%
          </label>
          <input id="modifier-chance" type="range" min="0" max="100" step="10" v-model="modifierProb"
            class="accent-gradient-to-br h-2 w-full rounded-lg bg-gray-200 from-green-400 to-blue-600"
            :disabled="gameType === 'standard'" />
        </div>

        <div class="flex">
          <SolidButton :class="'m-auto h-full w-32'" @click="">Play</SolidButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(["showRules"]);
const modifierProb = ref(50);
const gameType = ref<"standard" | "advanced">("standard");
</script>
