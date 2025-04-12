"use client";

import { AppContext } from "@/components/app-provider";
import TwoDimensionalBoard from "@/components/game-boards/two-dimensional-board";
// import ThreeGameBoard from "@/components/game-boards/three-game-board";
import { Button } from "@/components/ui/button";
import { Challenge, GameEngine } from "@/lib/game-engine";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const { settings } = useContext(AppContext);
  const [gameEngine] = useState(new GameEngine(settings));
  const [showModifierButton, setShowModifierButton] = useState(
    settings.modifierProbability === 0,
  );
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    const messages = gameEngine.updateSettings(settings);
    if (messages.includes("history.cleared")) {
      toast("Category/modifier play history cleared");
    }
    setShowModifierButton(
      settings.modifiers && settings.modifierProbability === 0,
    );
  }, [settings]);

  useEffect(() => nextTurn(), []);

  function nextTurn() {
    const challenge = gameEngine.nextTurn();
    setChallenges((prev) => {
      const newChallenges = prev.concat(challenge);
      if (newChallenges.length > 3) {
        newChallenges.shift();
      }
      return newChallenges;
    });
  }

  return (
    <div className="relative h-full w-full touch-none select-none">
      {/* <div className="absolute top-0 font-bold text-3xl ml-4 mt-2">Showoff</div> */}
      {/* <ThreeGameBoard /> */}
      <TwoDimensionalBoard challenges={challenges} />
      <div className="absolute bottom-0 flex w-full justify-center gap-3 px-4">
        <Button
          className="mb-4 h-12 w-28 grow md:h-8 md:flex-none"
          onClick={nextTurn}
        >
          Next turn
        </Button>
        {showModifierButton && (
          <Button
            variant="outline"
            className="mb-4 h-12 w-28 grow md:h-8 md:flex-none"
            onClick={() => {}}
          >
            Add modifier
          </Button>
        )}
      </div>
    </div>
  );
}
