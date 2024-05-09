<script setup lang="ts">
import jsonData from "./assets/data.json";

useHead({
  title: "Showoff",
  bodyAttrs: { class: "bg-white dark:bg-gray-900" },
});

type Data = {
  categories: Category[];
  modifiers: Modifier[];
};

type Category = {
  name: string;
  description?: string | string[];
  excluded?: string[];
};

type Modifier = {
  name: string;
  description?: string | string[];
  excluded?: string[];
};

const DATA: Data = setupData(); // backup of data
let categories: Category[] = [];
let modifiers: Modifier[] = [];
let playWithModifiers = true;

const showRules = ref(false);
const currCategory = ref<Cateogry | null>(null);
const currModifier = ref<Modifier | null>(null);

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
  currModifier.value = null;
  currCategory.value = getCategory();
  if (playWithModifiers && Math.random() < 1) {
    currModifier.value = getModifier();
  }
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
  <Transition
    enter-active-class="transition-opacity duration-300 ease-out"
    leave-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0 "
    leave-to-class="opacity-0"
  >
    <RulesModal v-if="showRules" @close-modal="showRules = false"></RulesModal>
  </Transition>

  <main class="sm:flex sm:justify-center">
    <div class="flex h-[calc(100dvh)] flex-col sm:w-[80%] lg:w-[50%]">
      <header class="m-5 flex">
        <h1 class="grow text-4xl font-extrabold dark:text-white">Showoff</h1>
        <HamburgerButton
          class="h-9 w-9 text-gray-800 dark:text-white"
          @click="showRules = true"
        >
        </HamburgerButton>
      </header>

      <div class="flex grow flex-col">
        <SolidButton class="mx-auto mb-6 w-28" @click="nextTurn()"
          >Next Turn</SolidButton
        >
        <div class="relative z-0 m-auto h-full w-96">
          <Card
            class="z-10"
            :category="currCategory"
            :modifier="currModifier"
          ></Card>
        </div>
      </div>
    </div>
  </main>
</template>
