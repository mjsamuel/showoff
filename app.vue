<script setup lang="ts">
import jsonData from "./public/data.json";

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
const currentCategory = useState<Category | null>("category", () => null);
const currentModifier = useState<Modifier | null>("modifier", () => null);
const canGetModifier = useState<boolean | null>("canGetModifier", () => false);

function getCategory() {
  if (!categories || categories.length === 0) {
    categories = [...DATA.categories];
    shuffleArray(categories);
  }
  currentCategory.value = categories.pop();
  currentModifier.value = null;
  canGetModifier.value = true;
}

function getModifier() {
  if (!modifiers || modifiers.length === 0) {
    modifiers = [...DATA.modifiers];
    shuffleArray(modifiers);
  }
  currentModifier.value = modifiers.pop();
  canGetModifier.value = false;
}

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
  <main class="mt-24">
    <div class="mx-auto max-w-screen-xl px-4 py-8 lg:px-6 lg:py-16">
      <div class="mx-auto max-w-screen-sm text-center">
        <h1 class="text-primary-600 mb-4 text-7xl font-extrabold tracking-tight lg:text-8xl dark:text-white">
          Showoff
        </h1>
        <p class="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
          <button @click="getCategory"
            class="mb-2 me-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            Category
          </button>
          <button type="button" v-if="canGetModifier" @click="getModifier"
            class="mb-2 me-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700">
            Modifier
          </button>
          <button v-else disabled
            class="mb-2 me-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
            Modifier
          </button>
        </p>
        <div v-if="currentCategory">
          <p class="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            {{ currentCategory.name }}
          </p>
          <p class="mb-4 text-lg font-light text-gray-500 dark:text-gray-400" v-html="currentCategory.description"></p>
        </div>
        <div v-if="currentModifier">
          <p class="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            {{ currentModifier.name }}
          </p>
          <p class="mb-4 text-lg font-light text-gray-500 dark:text-gray-400" v-html="currentModifier.description"></p>
        </div>
      </div>
    </div>
  </main>
</template>
