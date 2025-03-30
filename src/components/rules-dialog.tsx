"use client";

import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export function RulesDialog({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] h-[60vh] p-0 overflow-hidden [&>button:last-child]:hidden">
        <div className="overflow-y-auto p-6 flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>How to play</DialogTitle>
            <DialogDescription>
              Showoff is a game created for cardists to test their skill and
              knowledge in cardistry!
            </DialogDescription>
          </DialogHeader>
          <Rules />
          <DialogFooter>
            <DialogClose asChild>
              <Button>Got it!</Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RulesTitle({ children }: Readonly<{ children: React.ReactNode }>) {
  return <h3 className="font-bold mb-1">{children}</h3>;
}

function RulesOrderedList({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ol className="list-decimal ml-5 flex flex-col gap-1">{children}</ol>;
}

function RulesUnorderedList({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ul className="list-disc ml-4 flex flex-col gap-1">{children}</ul>;
}

function Rules() {
  return (
    <div className="flex flex-col gap-4 text-sm ">
      <div>
        <RulesTitle>Standard ruleset:</RulesTitle>
        <RulesOrderedList>
          <li>
            Each player starts by dealing three cards in front of them. These
            are their &apos;lives&apos;.
          </li>
          <li>
            Have each player cut to a random card in the deck. The person with
            the highest-valued card starts first
            <RulesUnorderedList>
              <li>Aces are high.</li>
              <li>If you cut to a Joker, you get to cut again.</li>
              <li>
                If you&apos;re using a deck without values... then too bad!
              </li>
            </RulesUnorderedList>
          </li>
          <li>
            On each player&apos;s turn, tap/click the
            &apos;category&apos;/&apos;next turn&apos; button to generate a
            random category. The player must now perform a move from that
            category to successfully complete their turn.
          </li>
          <li>
            If the player:
            <RulesUnorderedList>
              <li>Drops any cards,</li>
              <li>
                Repeats a move that has been done by anyone else before in that
                particular game,
              </li>
              <li>
                Can&apos;t think of any move to perform that fits that category,
              </li>
            </RulesUnorderedList>
            then they remove one of their cards in front of them, losing one
            &apos;life&apos; and ending their turn.
          </li>
          <li>
            The game ends when one player loses all their &apos;lives&apos;,
            leaving the other player as the winner (with all their according
            bragging rights)
          </li>
        </RulesOrderedList>
      </div>
      <div>
        <RulesTitle>Modifiers:</RulesTitle>
        <RulesOrderedList>
          <li>
            With this optional mode activated, extra challenges are added into
            the game at random in order to raise the stakes.
          </li>
          <li>
            On each turn, there&apos;s a chance that the move category will also
            be generated along with a &apos;modifier&apos; below.
          </li>
          <li>
            If a modifier is added, then the player must fulfill the entire
            challenges&apos;s conditions - both the move category WITH the
            modifier - in order to successfully complete their turn. If they
            fail to do so, then that player loses a life.
          </li>
          <li>
            With great risk comes great rewards, of course: if a player
            completes a turn using a modifier, then their opponent loses one
            life, thereby expediting the game.
          </li>
        </RulesOrderedList>
      </div>
      <div>
        <RulesTitle>Battle Royal:</RulesTitle>
        <RulesOrderedList>
          <li>This mode is for 3+ players and above.</li>
          <li>
            In this mode, each player deals out 2 lives instead of 3 in order to
            expedite the game.
          </li>
          <li>
            Players cut high card to determine who starts first. The play then
            continues in a clockwise direction. (If playing online, play
            continues in alphabetical order of the player’s names).
          </li>
          <li>
            As per regular play, if any of the players:
            <RulesUnorderedList>
              <li>Drops any cards</li>
              <li>
                Repeats a move that has been done by anyone else before in that
                particular game
              </li>
              <li>
                Can&apos;t think of any move to perform that fits that category
              </li>
            </RulesUnorderedList>
            ...then that player loses 1 life. If a player loses all of their
            lives, then they are knocked out of the game. The game ends when
            only one player is left standing.
          </li>
          <li>
            Battle Royale mode can also be played using modifiers. If a player
            makes a successful play with a modifier, then they can
            &apos;target&apos; any other opponent and cause them to lose 1 life.
          </li>
        </RulesOrderedList>
      </div>
    </div>
  );
}
