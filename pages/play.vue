<template>
  <div class="flex h-full flex-col">
    <header class="m-5 flex">
      <h1 class="grow text-4xl font-extrabold dark:text-white">
        <button @click="navigateTo({ path: '/' })">Showoff</button>
      </h1>
      <QuestionButton class="h-6 w-6 text-gray-800 dark:text-white" @click="$emit('showRules')">
      </QuestionButton>
    </header>

    <div class="flex grow flex-col">
      <SolidButton class="mx-auto  hidden sm:mt-20 sm:block" @click="nextTurn">Next turn</SolidButton>
      <div class="relative z-0 m-auto block h-full w-96 items-center sm:hidden">
        <CardsMobile :cards="cards" @category-entered="trimCards"></CardsMobile>
      </div>
      <div class="relative z-0 mb-28 sm:flex hidden h-full w-full justify-center mt-">
        <CardsDesktop :cards="cards" @category-entered="trimCards"></CardsDesktop>
      </div>
    </div>
  </div>

  <div class="fixed bottom-0 z-0 flex h-16 w-full pb-4 sm:hidden">
    <SolidButton class="mx-auto mb-1 sm:hidden" @click="nextTurn">Next turn</SolidButton>
  </div>
</template>

<script setup lang="ts">
import jsonData from "./assets/data.json";
import { onMounted } from "vue";

const emit = defineEmits(["showRules"]);

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

const data = {
  categories: preparePrompts(jsonData.categories),
  modifiers: preparePrompts(jsonData.modifiers),
};

let playWithModifiers = false;
let modifierProbability = 0;

const cards = ref<Challenge[]>([]);

onMounted(() => {
  document.addEventListener("keydown", (event) => {
    if (event.key === "n") {
      nextTurn();
    }
  });

  const params = { ...useRoute().query };

  if (!params.gameType) {
    navigateTo({ path: "/" });
  }

  if (params.gameType === "advanced") {
    playWithModifiers = true;
    modifierProbability =
      clamp(Number(params.modifierProbability), 10, 100) / 100;
  }

  nextTurn();
});

function nextTurn() {
  const category = { ...getPrompt("categories"), rotation: randomNumberInRange(-2, 2, [0]) };
  let modifier;
  if (playWithModifiers && Math.random() < modifierProbability) {
    modifier = { ...getPrompt("modifiers", category.excluded), rotation: randomNumberInRange(-2, 2, [0]) };
    modifier.rotation = randomNumberInRange(-2, 2);
  }
  cards.value.push({ category, modifier });
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

function trimCards() {
  if (cards.value.length <= 1) {
    return;
  }
  cards.value.shift();
}

function randomNumberInRange(min: number, max: number, excluded: number[] = []): number {
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
