<template>
  <div class="flex h-screen items-center">
    <div class="mb-36 flex w-full flex-col items-center">
      <h1 class="text-6xl font-extrabold dark:text-white">Showoff</h1>
      <h2 class="mb-4">
        <button class="font-semibold text-gray-900 underline decoration-blue-600
            dark:text-white dark:decoration-green-400" @click="$emit('showRules')">
          How to play
        </button>
      </h2>
      <form class="flex w-[80%] flex-col space-y-8 rounded-xl bg-gray-100 p-6
          text-base font-medium text-gray-900 shadow-xl sm:w-[60%]">
        <div class="flex items-center">
          <input id="repeat-checkbox" type="checkbox" v-model="form.allowRepeats"
            class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600" />
          <label for="repeat-checkbox" class="ms-2">Repeat categories/modifiers</label>
        </div>

        <div class="flex items-center">
          <input id="modifier-checkbox" type="checkbox" v-model="form.playWithModifiers"
            class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600" />
          <label for="modifier-checkbox" class="ms-2">Play with modifiers</label>
        </div>

        <div>
          <label for="modifier-chance" class="mb-2">
            Modifier probability:
            {{
              form.modifierProbability == 0
                ? 'Player choice'
                : `${form.modifierProbability}%`
            }}
          </label>
          <input id="modifier-chance" type="range" min="0" max="100" step="10" v-model="form.modifierProbability" class="accent-gradient-to-br h-3 w-full rounded-lg bg-gray-200
              from-green-400 to-blue-600" :disabled="!form.playWithModifiers" />
        </div>

        <div class="flex">
          <SolidButton :class="'m-auto h-full w-32'" @click="playGame()">Play</SolidButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
type Form = {
  allowRepeats: boolean
  playWithModifiers: boolean
  modifierProbability?: number
}

const emit = defineEmits(['showRules'])
const form = ref<Form>({
  allowRepeats: true,
  playWithModifiers: false,
  modifierProbability: 30,
})

async function playGame() {
  let query: { repetition: string; modifierOpts?: number | 'choice' } = {
    repetition: form.value.allowRepeats.toString(),
  }
  if (form.value.playWithModifiers) {
    const probability = form.value.modifierProbability
    query.modifierOpts = probability == 0 ? 'choice' : probability
  }
  await navigateTo({ path: '/play', query })
}
</script>
