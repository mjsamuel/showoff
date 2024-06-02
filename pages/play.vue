<template>
  <div class="flex h-full flex-col">
    <header class="m-5 flex">
      <h1 class="grow text-4xl font-extrabold dark:text-white">
        <button @click="navigateTo({ path: '/' })">Showoff</button>
      </h1>
      <QuestionButton class="h-6 w-6 text-gray-800 dark:text-white" @click="$emit('showRules')">
      </QuestionButton>
    </header>

    <div :class="`grow flex-col flex  ${animating ? 'overflow-y-clip' : ''}`">
      <div class="mx-auto mt-4 hidden sm:block">
        <SolidButton @click="nextTurn" class="h-full w-28">Next turn</SolidButton>
        <SolidButton v-if="dealersChoice" :disabled="!canRequestModifier" @click="getModifier" class="ml-3 h-full w-28">
          + Modifier
        </SolidButton>
      </div>
      <Cards :cards="cards" @started-animating="animationsStarted" @finished-animating="animationsFinished" />
    </div>
  </div>

  <div class="fixed bottom-0 z-0 flex h-16 w-full justify-center pb-4 sm:hidden">
    <div>
      <SolidButton @click="nextTurn" class="h-full w-32">Next turn</SolidButton>
      <SolidButton v-if="dealersChoice" :disabled="!canRequestModifier" @click="getModifier" class="ml-3 h-full w-32">
        + Modifier
      </SolidButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import jsonData from "../assets/data.json";
import { onMounted } from "vue";

type Prompt = {
  name: string;
  description?: string | string[];
  excluded?: string[];
};
type KeyedPrompt = Prompt & { key: string };
type Challenge = {
  category: KeyedPrompt & { rotation: number };
  modifier?: KeyedPrompt & { rotation: number };
};

const emit = defineEmits(["showRules"]);

const data = {
  categories: preparePrompts(jsonData.categories),
  modifiers: preparePrompts(jsonData.modifiers),
};

const cards = ref<Challenge[]>([]);
const canRequestModifier = ref<boolean>(false);
const animating = ref<boolean>(false);

const query = { ...useRoute().query };
let allowRepeats = query.repetition === "true";
let dealersChoice = query.modifierOpts === "choice";
let modifierProbability = 0;
if (!dealersChoice && query.modifierOpts) {
  modifierProbability = clamp(Number(query.modifierOpts), 10, 100) / 100;
}

onMounted(() => {
  document.addEventListener("keydown", (event) => {
    if (event.key === "n") {
      nextTurn();
    }
  });
  nextTurn();
});

function nextTurn() {
  const category = {
    ...getPrompt("categories", undefined, !allowRepeats),
    rotation: randomNumberInRange(-2, 2, [0]),
  };

  let modifier;
  if (modifierProbability && Math.random() < modifierProbability) {
    modifier = {
      ...getPrompt("modifiers", category.excluded, !allowRepeats),
      rotation: randomNumberInRange(-2, 2, [0]),
    };
  }

  if (dealersChoice) {
    canRequestModifier.value = true;
  }

  cards.value.push({ category, modifier });
}

function getModifier() {
  const currentChallenge = cards.value[0];
  const modifier = {
    ...getPrompt(
      "modifiers",
      currentChallenge.category.excluded,
      !allowRepeats,
    ),
    rotation: randomNumberInRange(-2, 2, [0]),
  };
  currentChallenge.modifier = modifier;
  canRequestModifier.value = false;
}

function getPrompt(
  type: "categories" | "modifiers",
  excluded?: string[],
  deletePrompt = false,
) {
  let prompts = data[type];
  if (prompts.length === 0) {
    prompts = preparePrompts(jsonData[type] as Record<string, Prompt>);
  }

  let prompt: KeyedPrompt | null = null;
  while (!prompt) {
    const index = randomNumberInRange(0, prompts.length - 1);
    if (excluded?.includes(prompts[index].key)) {
      continue;
    }
    prompt = deletePrompt ? prompts.splice(index, 1).at(0)! : prompts[index];
  }

  return prompt;
}

function preparePrompts(prompts: Record<string, Prompt>) {
  return Object.entries(prompts).map(([key, prompt]) => {
    if (prompt.description instanceof Array) {
      prompt.description = prompt.description.join("");
    }
    return { key, ...prompt };
  });
}

function animationsStarted() {
  animating.value = true;
}

function animationsFinished() {
  animating.value = false;
  cards.value = cards.value.slice(-1);
}

function randomNumberInRange(
  min: number,
  max: number,
  excluded: number[] = [],
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
