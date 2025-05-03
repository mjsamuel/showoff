"use client";

import { SettingsContext } from "@/components/settings-provider";
import TwoDimensionalBoard from "@/components/game-boards/two-dimensional-board";
import { Button } from "@/components/ui/button";
import { Challenge, GameEngine } from "@/lib/game-engine";
import { useContext, useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [settings] = useContext(SettingsContext);
  const [prevSettings, setPrevSettings] = useState(settings);
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  // Initialize game engine and start the first turn when settings are ready
  if (settings.status === "ready" && !gameEngine) {
    const newGameEngine = new GameEngine(settings.settings);
    setGameEngine(newGameEngine);
    nextTurn(newGameEngine);
  }

  if (settings.status === "loading" || !gameEngine) {
    return <span>loading...</span>;
  }

  const showModifierButton =
    settings.settings.modifiers && settings.settings.modifierProbability === 0;
  const disableModifierButton = !!challenges[challenges.length - 1]?.modifier;

  // Update game engine settings when they change
  if (prevSettings !== settings) {
    setPrevSettings(settings);
    const updateMessages = gameEngine.updateSettings(settings.settings);
    if (updateMessages.includes("history.cleared")) {
      toast("Category/modifier play history cleared");
    }
  }

  function nextTurn(gameEngine: GameEngine) {
    const challenge = gameEngine.nextTurn();
    setChallenges([...challenges, challenge].slice(-50));
  }

  function addModifier(gameEngine: GameEngine) {
    const currentChallengeIndex = challenges.length - 1;
    const nextChallenges = challenges.map((c, i) => {
      if (i !== currentChallengeIndex) return c;
      const modifier = gameEngine.getModifier(c.category);
      return { ...c, modifier };
    });
    setChallenges(nextChallenges);
  }

  return (
    <div className="relative size-full">
      <TwoDimensionalBoard challenges={challenges} />
      <div className="absolute bottom-0 z-50 mb-5 flex h-14 w-full justify-center gap-3 px-12 md:h-10">
        <Button
          className="h-full w-28 grow md:flex-none"
          onClick={() => nextTurn(gameEngine)}
        >
          Next turn
        </Button>
        {showModifierButton && (
          <Button
            variant="secondary"
            className="h-full w-28 grow md:flex-none"
            onClick={() => addModifier(gameEngine)}
            disabled={disableModifierButton}
          >
            Add modifier
          </Button>
        )}
      </div>
    </div>
  );
}
