"use client";

import { AppContext } from "@/components/app-provider";
import TwoDimensionalBoard from "@/components/game-boards/two-dimensional-board";
import { Button } from "@/components/ui/button";
import { Challenge, GameEngine } from "@/lib/game-engine";
import { useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const { state } = useContext(AppContext);

  const gameEngine = useRef<GameEngine | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [showModButton, setShowModButton] = useState(false);
  const [modDisabled, setModButtonDisabled] = useState(false);

  // Initialize game engine and start the first turn
  useEffect(() => {
    if (state.status !== "ready" || gameEngine.current) return;
    gameEngine.current = new GameEngine(state.settings);
    nextTurn();
  }, [state]);

  // Update game engine settings when they change
  useEffect(() => {
    if (state.status !== "ready") return;

    const messages = gameEngine.current!.updateSettings(state.settings);
    if (messages.includes("history.cleared")) {
      toast("Category/modifier play history cleared");
    }
    const { modifiers, modifierProbability } = state.settings;
    setShowModButton(modifiers && modifierProbability === 0);
  }, [state]);

  function nextTurn() {
    const challenge = gameEngine.current!.nextTurn();
    setChallenges((prev) => {
      const newChallenges = prev.concat(challenge);
      if (newChallenges.length > 50) {
        newChallenges.shift();
      }
      return newChallenges;
    });
    setModButtonDisabled(false);
  }

  function addModifier() {
    if (!showModButton) return;
    setChallenges((c) => {
      const currentChallenge = c[challenges.length - 1];
      const modifier = gameEngine.current!.getModifier(
        currentChallenge.category,
      );
      currentChallenge.modifier = modifier;
      return [...c];
    });
    setModButtonDisabled(true);
  }

  return (
    <div className="relative size-full">
      <TwoDimensionalBoard challenges={challenges} />
      <div className="absolute bottom-0 z-50 mb-5 flex h-14 w-full justify-center gap-3 px-12 md:h-10">
        <Button
          className="h-full w-28 grow md:flex-none"
          onClick={nextTurn}
          disabled={state.status === "loading"}
        >
          Next turn
        </Button>
        {showModButton && (
          <Button
            variant="secondary"
            className="h-full w-28 grow md:flex-none"
            onClick={addModifier}
            disabled={modDisabled}
          >
            Add modifier
          </Button>
        )}
      </div>
    </div>
  );
}
