"use client";

import { AppContext } from "@/components/app-provider";
import TwoDimensionalBoard from "@/components/game-boards/two-dimensional-board";
import { Button } from "@/components/ui/button";
import { Challenge, GameEngine } from "@/lib/game-engine";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const { settings } = useContext(AppContext);
  const [gameEngine] = useState(new GameEngine(settings));
  const [showModButton, setShowModButton] = useState(
    settings.modifierProbability === 0,
  );
  const [modDisabled, setModButtonDisabled] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    const messages = gameEngine.updateSettings(settings);
    if (messages.includes("history.cleared")) {
      toast("Category/modifier play history cleared");
    }
    setShowModButton(settings.modifiers && settings.modifierProbability === 0);
  }, [settings]);

  useEffect(() => nextTurn(), []);

  function nextTurn() {
    const challenge = gameEngine.nextTurn();
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
      const modifier = gameEngine.getModifier(currentChallenge.category);
      currentChallenge.modifier = modifier;
      return [...c];
    });

    setModButtonDisabled(true);
  }

  return (
    <div className="relative size-full">
      <TwoDimensionalBoard challenges={challenges} />
      <div className="absolute bottom-0 z-50 mb-5 flex h-14 w-full justify-center gap-3 px-12 md:h-10">
        <Button className="h-full w-28 grow md:flex-none" onClick={nextTurn}>
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
