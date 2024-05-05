<template>
  <div
    class="relative z-10"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div class="fixed inset-0 bg-gray-900 bg-opacity-75"></div>

    <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
      <div
        class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
        @click.self="$emit('closeModal')"
      >
        <div
          class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
        >
          <!-- content -->
          <div
            class="relative rounded-lg bg-white shadow dark:bg-gray-700"
            tabindex="0"
            @keydown.esc="$emit('closeModal')"
          >
            <!-- Modal header -->
            <div
              class="flex items-center justify-between rounded-t border-b p-4 md:p-5 dark:border-gray-600"
            >
              <h2 class="text-4xl font-bold dark:text-white">Rules</h2>
              <button
                type="button"
                @click="$emit('closeModal')"
                class="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
                data-modal-hide="default-modal"
              >
                <svg
                  class="h-3 w-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span class="sr-only">Close modal</span>
              </button>
            </div>
            <!-- Modal body -->
            <div class="space-y-4 p-4 md:p-5">
              <div
                class="space-y-4 text-base leading-relaxed text-gray-500 dark:text-gray-300"
              >
                <p>
                  Showoff is a game created for cardists to test their skill and
                  knowledge in cardistry!<br />
                </p>

                <section>
                  <h3 class="text-2xl font-bold dark:text-white">
                    Here's how to play Showoff:
                  </h3>
                  <ol class="ml-5 list-decimal">
                    <li>
                      Start by dealing three cards in front of you. These are
                      your 'lives'
                    </li>
                    <li>
                      Have each player cut to a random card in the deck. The
                      person with the highest-valued card starts first (Aces are
                      high. If you cut to a Joker, you get to cut again. Also,
                      if you're using a deck without values... then too bad!)
                    </li>
                    <li>
                      On each player's turn, tap/click the 'category'/'next
                      turn' button to generate a random category. The player
                      must now perform a move from that category to successfully
                      complete their turn.
                    </li>
                    <li>If the player:</li>
                    <ol class="ml-10 list-decimal">
                      <li>Drops any cards</li>
                      <li>
                        Repeats a move that has been done by anyone else before
                        in that particular game
                      </li>
                      <li>
                        Can't think of any move to perform that fits that
                        category
                      </li>
                    </ol>
                    <li class="list-none">
                      ...then they remove one of their cards in front of them,
                      losing one 'life' and ending their turn.
                    </li>
                    <li>
                      The game ends when one player loses all their 'lives',
                      leaving the other player as the winner (with all their
                      according bragging rights)
                    </li>
                  </ol>
                </section>

                <section>
                  <h3 class="text-2xl font-bold dark:text-white">Modifiers</h3>
                  <ol class="ml-5 list-decimal">
                    <li>
                      With this optional mode activated, extra challenges are
                      added into the game at random in order to raise the stakes
                    </li>
                    <li>
                      On each turn, there's a chance that the move category will
                      also be generated along with a 'modifier' below.
                    </li>
                    <li>
                      If a modifier is added, then the player must fulfill the
                      entire challenges's conditions - both the move category
                      WITH the modifier - in order to successfully complete
                      their turn. If they fail to do so, then that player loses
                      a life.
                    </li>
                    <li>
                      With great risk comes great rewards, of course: if a
                      player completes a turn using a modifier, then their
                      opponent loses one life, thereby expediting the game.
                    </li>
                  </ol>
                </section>

                <section>
                  <h3 class="text-2xl font-bold dark:text-white">
                    Battle Royale
                  </h3>
                  <ol class="ml-5 list-decimal">
                    <li>This mode is for 3+ players and above.</li>
                    <li>
                      In this mode, each player deals out 2 lives instead of 3
                      in order to expedite the game.
                    </li>
                    <li>
                      Players cut high card to determine who starts first. The
                      play then continues in a clockwise direction. (If playing
                      online, play continues in alphabetical order of the
                      player’s names).
                    </li>
                    <li>As per regular play, if any of the players:</li>
                    <ol class="ml-10 list-decimal">
                      <li>Drops any cards</li>
                      <li>
                        Repeats a move that has been done by anyone else before
                        in that particular game
                      </li>
                      <li>
                        Can't think of any move to perform that fits that
                        category
                      </li>
                    </ol>
                    <li class="list-none">
                      ...then that player loses 1 life. If a player loses all of
                      their lives, then they are knocked out of the game.
                    </li>
                    <li>
                      The game ends when only one player is left standing.
                    </li>
                    <li>
                      Battle Royale mode can also be played using modifiers. If
                      a player makes a successful play with a modifier, then
                      they can 'target' any other opponent and cause them to
                      lose 1 life.
                    </li>
                  </ol>
                </section>

                <section>
                  <h3 class="text-2xl font-bold dark:text-white">About</h3>
                  <p>
                    Showoff was conceived of and developed by
                    <a
                      class="font-medium text-blue-600 hover:underline dark:text-blue-500"
                      href="https://www.instagram.com/kevdoescards/"
                      >Kevin Ho</a
                    >
                    , who was inspired by a beta version of The Cardistry Card
                    Game by
                    <a
                      class="font-medium text-blue-600 hover:underline dark:text-blue-500"
                      href="https://www.instagram.com/bizandfriends/"
                      >Biz</a
                    >
                    . Special thanks to
                    <a
                      class="font-medium text-blue-600 hover:underline dark:text-blue-500"
                      href="https://www.instagram.com/mattbeaudouin/"
                      >Matthew Beaudouin</a
                    >
                    who coded an early demo version of the game and for helping
                    to write the category descriptions, and to
                    <a
                      class="font-medium text-blue-600 hover:underline dark:text-blue-500"
                      href="https://www.instagram.com/matt.samuel/"
                      >Matt Samuel</a
                    >
                    for programming this iteration of the game. And lastly, a
                    big shout-out to the OG
                    <a
                      class="font-medium text-blue-600 hover:underline dark:text-blue-500"
                      href="https://www.instagram.com/brian_tudor/"
                      >Brian Tudor</a
                    >
                    for inspiring the name of this game, without whom none of us
                    would be here.
                  </p>
                </section>

                <section>
                  <h3 class="text-2xl font-bold dark:text-white">
                    Suggestions
                  </h3>
                  <p>
                    Have any category/rule suggestions after trying the game
                    out? Want to let us know how we can improve Showoff and make
                    it better? Just shoot us a message with your feedback at
                    <a
                      class="font-medium text-blue-600 hover:underline dark:text-blue-500"
                      href="mailto:visualmadness@gmail.com"
                      >visualmadness@gmail.com</a
                    >
                    and we'll do our best to get back to you ASAP.
                  </p>
                </section>

                <section>Happy playing!</section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
