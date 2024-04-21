<script setup lang="ts">
import jsonData from "./public/data.json";

useHead({ bodyAttrs: { class: 'bg-white dark:bg-gray-900 ' } })

type Data = {
  categories: Category[];
  modifiers: Modifier[];
};

type Category = {
  id: number;
  name: string;
  description: string | string[];
  excludedModifiers: number[]; // id of modifiers
};

type Modifier = {
  name: string;
  description: string | string[];
  excludedCategory: number[]; // id of category
};

const DATA: Data = setupData();
let categories: Category[] = null;
let modifiers: Modifier[] = null;
const currentCategory = useState<Category>("category", () => null);
const currentModifier = useState<Modifier>("modifier", () => null);

function getCategory() {
  if (!categories || categories.length === 0) {
    categories = [...DATA.categories];
    shuffleArray(categories);
  }
  currentCategory.value = categories.pop();
}

function getModifier() {
  if (!modifiers || modifiers.length === 0) {
    modifiers = [...DATA.modifiers];
    shuffleArray(modifiers);
  }
  currentModifier.value = modifiers.pop();
}

function setupData() {
  let data = jsonData;
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

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

</script>

<template>
  <section class="mt-24">
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
      <div class="mx-auto max-w-screen-sm text-center">
        <h1 class="mb-4 text-7xl tracking-tight font-extrabold lg:text-8xl text-primary-600 dark:text-white">
          Showoff
        </h1>
        <p class="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">
          <button @click="getCategory"
            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
            Category
          </button>
          <button disabled
            class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
            Modifier
          </button>
        </p>
        <div v-if="currentCategory">
          <p class="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">
            {{ currentCategory.name }}</p>
          <p class="mb-4 text-lg font-light text-gray-500 dark:text-gray-400" v-html="currentCategory.description"></p>
        </div>
      </div>
    </div>
  </section>
</template>
