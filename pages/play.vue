<template>
  <div class="flex h-[calc(100dvh)] flex-col sm:w-[80%] lg:w-[50%]">
    <header class="m-5 flex">
      <h1 class="grow text-4xl font-extrabold dark:text-white">
        <button @click="reset">Showoff</button>
      </h1>
      <QuestionButton class="h-6 w-6 text-gray-800 dark:text-white" @click="showRules = true">
      </QuestionButton>
    </header>

    <div class="flex grow flex-col">
      <ButtonRow class="mx-auto mb-4 hidden sm:block" :game-started="cards.length" @start-game="startGame"
        @next-turn="nextTurn"></ButtonRow>
      <div class="relative z-0 m-auto h-full w-96">
        <Cards :cards="cards" @category-entered="trimCards"></Cards>
      </div>
    </div>
  </div>

  <div class="fixed bottom-0 left-0 z-0 flex h-16 w-full pb-4 sm:hidden">
    <ButtonRow class="mx-auto mb-1 sm:hidden" :game-started="cards.length" @start-game="startGame"
      @next-turn="nextTurn"></ButtonRow>
  </div>
</template>

<script setup lang="ts">
import jsonData from "./assets/data.json";
import { onMounted } from "vue";

type Prompt = {
  name: string;
  description?: string | string[];
  excluded?: string[];
};
type KeyedPrompt = Prompt & { key: string };

type Card = {
  category: KeyedPrompt;
  modifier?: KeyedPrompt;
};

const MODIFIER_PROBABILITY = 0.3;

const data = {
  categories: preparePrompts(jsonData.categories),
  modifiers: preparePrompts(jsonData.modifiers),
};
let playWithModifiers = true;

const showRules = ref(false);
const cards = ref<Card[]>([]);

onMounted(() => {
  document.addEventListener("keydown", (event) => {
    if (event.key === "?") {
      showRules.value = !showRules.value;
    } else if (event.key === "Escape") {
      showRules.value = false;
    } else if (event.key === "n" && cards.value.length) {
      nextTurn();
    }
  });
});

function startGame(useModifiers: boolean) {
  playWithModifiers = useModifiers;
  nextTurn();
}

function nextTurn() {
  const category = getPrompt("categories");
  let modifier;
  if (playWithModifiers && Math.random() < MODIFIER_PROBABILITY) {
    modifier = getPrompt("modifiers", category.excluded);
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

function reset() {
  cards.value = [];
}

function randomNumberInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
</script>

<style lang="postcss">
* {
  @apply touch-manipulation;
}
</style>
