<script setup lang="ts">
import jsonData from "./assets/data.json";

useHead({ bodyAttrs: { class: "bg-white dark:bg-gray-900 " } });

type Data = {
  categories: Category[];
  modifiers: Modifier[];
};

type Category = {
  id: number;
  name: string;
  description?: string | string[];
  excludedModifiers?: number[] | string[]; // id of modifiers
};

type Modifier = {
  name: string;
  description?: string | string[];
  excludedModifiers?: number[] | string[]; // id of modifiers
};

const DATA: Data = setupData();
let categories: Category[] = [];
let modifiers: Modifier[] = [];
let playWithModifiers = false;

const showRules = ref(false);
const currentCategory = ref<Category | null>(null);
const currentModifier = ref<Modifier | null>(null);

function setupData() {
  let data: Data = jsonData;

  data.categories.forEach((category) => {
    if (category.description instanceof Array) {
      category.description = category.description.join("");
    }
  });

  data.modifiers.forEach((modifier) => {
    if (modifier.description instanceof Array) {
      modifier.description = modifier.description.join("");
    }
  });

  return data;
}

function startGame(useModifiers: boolean) {
  playWithModifiers = useModifiers;
  nextTurn();
}

function nextTurn() {
  currentModifier.value = null;
  currentCategory.value = getCategory();
  if (playWithModifiers && Math.random() < 0.3) {
    currentModifier.value = getModifier();
  }
}

function getCategory() {
  let category = categories.pop();
  if (category === undefined) {
    categories = [...DATA.categories];
    shuffleArray(categories);
    category = categories.pop();
  }
  return category!;
}

function getModifier() {
  let modifier = modifiers.pop();
  if (modifier === undefined) {
    modifiers = [...DATA.modifiers];
    shuffleArray(modifiers);
    modifier = modifiers.pop();
  }
  return modifier!;
}

function shuffleArray(array: any[]) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}
</script>

<template>
  <RulesModal v-if="showRules" @close-modal="showRules = false"></RulesModal>
  <main>
    <div class="mx-auto mt-24 max-w-screen-xl px-4 py-8 lg:px-6 lg:py-16">
      <div class="mx-auto max-w-screen-sm text-center">
        <div class="absolute right-0 top-0 mr-4 mt-4">
          <button @click="showRules = true">
            <svg
              class="h-8 w-8 text-gray-800 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-width="2"
                d="M5 7h14M5 12h14M5 17h14"
              />
            </svg>
          </button>
        </div>

        <h1
          class="text-primary-600 mb-4 text-7xl font-extrabold tracking-tight lg:text-8xl dark:text-white"
        >
          Showoff
        </h1>

        <div
          class="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white"
        >
          <template v-if="!currentCategory">
            <SolidButton @click="startGame(false)">Play</SolidButton>
            <OutlineButton @click="startGame(true)">+ Modifiers</OutlineButton>
          </template>
          <OutlineButton v-else @click="nextTurn()">Next turn</OutlineButton>
        </div>

        <div class="text-left">
          <template v-if="currentCategory">
            <p
              class="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white"
            >
              {{ currentCategory.name }}
            </p>
            <p
              class="mb-4 text-lg font-light text-gray-500 dark:text-gray-400"
              v-html="currentCategory.description"
            ></p>
          </template>

          <template v-if="currentModifier">
            <p
              class="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white"
            >
              {{ currentModifier.name }}
            </p>
            <p
              class="mb-4 text-lg font-light text-gray-500 dark:text-gray-400"
              v-html="currentModifier.description"
            ></p>
          </template>
        </div>
      </div>
    </div>
  </main>
</template>
