<template>
  <div class="flex h-full flex-col">
    <header class="m-5 flex">
      <h1 class="grow text-4xl font-extrabold dark:text-white">
        <button @click="navigateTo({ path: '/' })">Showoff</button>
      </h1>
      <QuestionButton
        class="h-6 w-6 text-gray-800 dark:text-white"
        @click="$emit('showRules')"></QuestionButton>
    </header>

    <div class="flex grow flex-col">
      <div class="mx-auto mt-4 hidden sm:block">
        <SolidButton @click="nextTurn" class="h-full w-28">
          Next turn
        </SolidButton>
        <SolidButton
          v-if="dealersChoice"
          :disabled="!canRequestModifier"
          @click="getModifier"
          class="ml-3 h-full w-28">
          + Modifier
        </SolidButton>
      </div>
      <Cards
        ref="cardsComponent"
        :cards="cards"
        @category-entered="trimCards" />
    </div>
  </div>

  <div
    class="fixed bottom-0 z-0 flex h-16 w-full justify-center pb-4 sm:hidden">
    <div>
      <SolidButton @click="nextTurn" class="h-full w-32">Next turn</SolidButton>
      <SolidButton
        v-if="dealersChoice"
        :disabled="!canRequestModifier"
        @click="getModifier"
        class="ml-3 h-full w-32">
        + Modifier
      </SolidButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import jsonData from '../assets/data.json';

const emit = defineEmits(['showRules']);
const cards = ref<Challenge[]>([]);
const canRequestModifier = ref<boolean>(false);
const cardsComponent = ref();

type Prompt = {
  name: string;
  description?: string | string[];
  excluded?: string[];
  key?: string;
};
type Challenge = {
  turn: number;
  category: Prompt & { rotation?: number };
  modifier?: Prompt & { rotation?: number };
};

const data = {
  categories: preparePrompts(jsonData.categories),
  modifiers: preparePrompts(jsonData.modifiers),
};

let query = { ...useRoute().query };
let allowRepeats = query.repetition === 'true';
let dealersChoice = query.modifierOpts === 'choice';
let modifierProbability = 0;
let turn: number = 1;
if (!dealersChoice && query.modifierOpts) {
  modifierProbability = clamp(Number(query.modifierOpts), 10, 100) / 100;
}

onMounted(() => {
  document.addEventListener('keydown', (event) => {
    if (event.key === 'n') {
      nextTurn();
    }
  });
  nextTurn();
});

function nextTurn() {
  const category = getPrompt('categories', undefined, !allowRepeats);

  let modifier;
  if (modifierProbability && Math.random() < modifierProbability) {
    modifier = getPrompt('modifiers', category.excluded, !allowRepeats);
  }

  if (dealersChoice) {
    canRequestModifier.value = true;
  }

  cards.value.push({ turn: turn++, category, modifier });
}

function getModifier() {
  const currentChallenge = cards.value[0];
  currentChallenge.modifier = getPrompt( 'modifiers', currentChallenge.category.excluded, !allowRepeats);
  canRequestModifier.value = false;
  setTimeout(() => {
    cardsComponent.value.showModifier = true;
  }, 1);
}

function getPrompt(
  type: 'categories' | 'modifiers',
  excluded?: string[],
  deletePrompt = false
) {
  let prompts = data[type];
  if (prompts.length === 0) {
    prompts = preparePrompts(jsonData[type] as Record<string, Prompt>);
  }

  let prompt: Prompt | null = null;
  while (!prompt) {
    const index = randomNumberInRange(0, prompts.length - 1);
    if (excluded?.includes(prompts[index].key)) {
      continue;
    }
    prompt = deletePrompt ? prompts.splice(index, 1).at(0)! : prompts[index];
  }

  return {
    ...prompt,
    rotation: randomNumberInRange(-2, 2, [0]),
  };
}

function preparePrompts(prompts: Record<string, Prompt>) {
  return Object.entries(prompts).map(([key, prompt]) => {
    if (prompt.description instanceof Array) {
      prompt.description = prompt.description.join('');
    }
    return { key, ...prompt };
  });
}

function trimCards() {
  if (cards.value.length <= 1) {
    return;
  }
  cards.value.shift();
}

function randomNumberInRange(
  min: number,
  max: number,
  excluded: number[] = []
): number {
  const random = Math.floor(Math.random() * (max - min + 1)) + min;
  if (excluded.includes(random)) {
    return randomNumberInRange(min, max, excluded);
  }
  return random;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
</script>
