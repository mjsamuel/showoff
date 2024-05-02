<script setup lang="ts">
import jsonData from "./assets/data.json";

useHead({
  bodyAttrs: { class: "bg-white dark:bg-gray-900 touch-manipulation" },
});

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

const rotate = 2;
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-300 ease-out"
    leave-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0 "
    leave-to-class="opacity-0"
  >
    <RulesModal v-if="showRules" @close-modal="showRules = false"></RulesModal>
  </Transition>

  <RulesButton @click="showRules = true"></RulesButton>

  <main></main>
</template>
