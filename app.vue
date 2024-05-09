<script setup lang="ts">
import jsonData from "./assets/data.json";

useHead({
  title: "Showoff",
  bodyAttrs: { class: "bg-white dark:bg-gray-900" },
});

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

const MODIFIER_PROBABILITY = 1;
const MAX_CARDS = 3;

const data = {
  categories: preparePrompts(jsonData.categories),
  modifiers: preparePrompts(jsonData.modifiers),
};
let playWithModifiers = true;

const showRules = ref(false);
const cards = ref<Card[]>([]);

function preparePrompts(prompts: Record<string, Prompt>) {
  return Object.entries(prompts).map(([key, prompt]) => {
    if (prompt.description instanceof Array) {
      prompt.description = prompt.description.join("");
    }
    return { key, ...prompt };
  });
}

function getPrompt(type: "categories" | "modifiers", excluded?: string[]) {
  let prompts = data[type];
  if (prompts.length === 0) {
    prompts = preparePrompts(jsonData[type] as Record<string, Prompt>);
  }

  const index = randomNumberInRange(0, prompts.length - 1);
  let prompt: KeyedPrompt | null = null;
  while (!prompt) {
    prompt = prompts[index];
  }
  prompts.splice(index, 1);
  return prompt;
}

function startGame(useModifiers: boolean) {
  playWithModifiers = useModifiers;
  nextTurn();
}

function nextTurn() {
  const category = getPrompt("categories");
  let modifier;
  if (playWithModifiers && Math.random() < MODIFIER_PROBABILITY) {
    modifier = getPrompt("modifiers");
  }
  cards.value.push({ category, modifier });
  if (cards.value.length > MAX_CARDS) {
    cards.value.shift();
  }
}

function randomNumberInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
</script>

<template>
  <Transition enter-active-class="transition-opacity duration-300 ease-out"
    leave-active-class="transition-opacity duration-200" enter-from-class="opacity-0 " leave-to-class="opacity-0">
    <RulesModal v-if="showRules" @close-modal="showRules = false"></RulesModal>
  </Transition>

  <main class="sm:flex sm:justify-center">
    <div class="flex h-[calc(100dvh)] flex-col sm:w-[80%] lg:w-[50%]">
      <header class="m-5 flex">
        <h1 class="grow text-4xl font-extrabold dark:text-white">Showoff</h1>
        <HamburgerButton class="h-9 w-9 text-gray-800 dark:text-white" @click="showRules = true">
        </HamburgerButton>
      </header>

      <div class="flex grow flex-col">
        <SolidButton class="mx-auto mb-6 w-28" @click="nextTurn()">Next Turn</SolidButton>
        <div class="relative z-0 m-auto h-full w-96">
          <Card :cards="cards"></Card>
        </div>
      </div>
    </div>

  </main>
</template>
