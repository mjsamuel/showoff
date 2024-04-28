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
const showRules = ref(false);

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

const isOpen = ref(false);
</script>

<template>
  <div v-if="showRules" class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"></div>
    <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div
          class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <!-- content -->
          <div class="relative rounded-lg bg-white shadow dark:bg-gray-700">
            <!-- Modal header -->
            <div class="flex items-center justify-between rounded-t border-b p-4 md:p-5 dark:border-gray-600">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                Rules
              </h3>
              <button type="button" @click="showRules = false"
                class="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
                data-modal-hide="default-modal">
                <svg class="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 14 14">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
                <span class="sr-only">Close modal</span>
              </button>
            </div>
            <!-- Modal body -->
            <div class="space-y-4 p-4 md:p-5">
              <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                Showoff is a game created for cardists to test their skill and
                knowledge in cardistry! Here's how to play Showoff: Start by
                dealing 3 cards in front of you. These are your 'lives' Have
                each player cut to a random card in the deck. The person with
                the highest-valued card starts first (Aces are high. Also, if
                you're using a deck without values... then too bad!) On each
                player's turn, tap/click the 'category' button to generate a
                random category. The player must now perform a move from that
                category to successfully complete their turn. If the player:
                Drops any cards Repeats a move that has been done by anyone else
                before in that particular game Can't think of any move to
                perform that fits that category ...then they remove one of their
                cards in front of them, losing one 'life' and ending their turn.
                The game ends when one player loses all their 'lives', leaving
                the other player as the winner (with all their according
                bragging rights) Advanced Rules Modifiers With this optional
                mode, extra challenges are added into the game at random in
                order to raise the stakes On each turn, there's a chance that
                the move category will also be generated along with a 'modifier'
                below. If a modifier is added, then the player must fulfill the
                entire challenges's conditions - both the move category WITH the
                modifier - in order to successfully complete their turn. With
                great risk comes great rewards, of course: if a player completes
                a turn using a modifier, then their opponent loses one life,
                thereby expediting the game. Battle Royale This mode is for 3+
                players and above. In this mode, no 'lives' are needed. Each
                player by default gets only one 'life', so there's no need to
                keep track with playing cards Players cut high card to determine
                who starts first. The play then continues in a clockwise
                direction. (If playing online, play continues in alphabetical
                order of the player’s names). Because each player only has 1
                life, if any of them Drops any cards Repeats a move that has
                been done by anyone else before in that particular game Can't
                think of any move to perform that fits that category ...then
                that player is knocked out of the game. The game ends when only
                one player is left standing. Battle Royale mode can also be
                played using modifiers. If a player makes a successful play with
                a modifier, then they can 'target' any other opponent and knock
                them out of the game. About Showoff was conceived of and
                developed by Kevin Ho, who was inspired by a beta version of The
                Cardistry Card Game by Biz. Special thanks to Matthew Beaudouin
                who coded an early demo version of the game and for helping to
                write the category descriptions, and to Matt Samuel for
                programming this iteration of the game. And lastly, a big
                shout-out to the OG Brian Tudor for inspiring the name of this
                game, without whom none of us would be here. Suggestions Have
                any category/rule suggestions after trying the game out? Want to
                let us know how we can improve Showoff and make it better? Just
                shoot us a message with your feedback at visualmadness@gmail.com
                and we'll do our best to get back to you ASAP. Happy playing!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <main class="mt-24">
    <div class="mx-auto max-w-screen-xl px-4 py-8 lg:px-6 lg:py-16">
      <div class="mx-auto max-w-screen-sm text-center">
        <div class="absolute right-0 top-0 mr-4 mt-4">
          <button @click="showRules = true">
            <svg class="h-8 w-8 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
              width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M5 7h14M5 12h14M5 17h14" />
            </svg>
          </button>
        </div>

        <h1 class="text-primary-600 mb-4 text-7xl font-extrabold tracking-tight lg:text-8xl dark:text-white">
          Showoff
        </h1>

        <div class="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
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
        </div>

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
