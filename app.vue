<script setup lang="ts">
import jsonData from "./assets/data.json";

useHead({
  title: "Showoff",
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

const DATA: Data = setupData(); // backup of data
let categories: Category[] = [];
let modifiers: Modifier[] = [];
let playWithModifiers = true;

const showRules = ref(false);
const prompt = ref<String | null>(null);
const categoryDesc = ref<String | null>(null);
const modifierDesc = ref<String | null>(null);

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
  modifierDesc.value = null;
  const currentCategory = getCategory();
  categoryDesc.value = currentCategory.description;
  let p = currentCategory.name;
  if (playWithModifiers && Math.random() < 0.3) {
    const currentModifier = getModifier();
    modifierDesc.value = currentModifier.description;
    p += `... ${currentModifier.name}`;
  }
  prompt.value = p
}

function getCategory(): Category {
  let category = categories.pop();
  if (category === undefined) {
    categories = [...DATA.categories];
    shuffleArray(categories);
    category = categories.pop();
  }
  return category!;
}

function getModifier(): Modifier {
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
  <Transition enter-active-class="transition-opacity duration-300 ease-out"
    leave-active-class="transition-opacity duration-200" enter-from-class="opacity-0 " leave-to-class="opacity-0">
    <RulesModal v-if="showRules" @close-modal="showRules = false"></RulesModal>
  </Transition>

  <main class="sm:flex sm:justify-center">
    <div class="flex h-[calc(100dvh)] flex-col sm:w-[80%] lg:w-[50%]">
      <header class="m-5 flex">
        <h1 class="grow text-4xl font-extrabold dark:text-white">Showoff</h1>
        <HamburgerButton class="h-7 w-7 text-gray-800 sm:h-7 sm:w-7 dark:text-white" @click="showRules = true">
        </HamburgerButton>
      </header>

      <div class="flex grow flex-col">
        <div class="my-auto flex flex-col">
          <div class="relative z-0 h-96">
            <Card class="z-30" :prompt="prompt" :category-desc="categoryDesc" :modifier-desc="modifierDesc"></Card>
            <Card class="pointer-events-none z-20 rotate-3"></Card>
            <Card class="pointer-events-none z-10 -rotate-2"></Card>
          </div>

          <SolidButton class="mx-auto mt-10 w-28 sm:mb-20" @click="nextTurn()">Next Turn</SolidButton>
        </div>
      </div>
    </div>
  </main>
</template>
