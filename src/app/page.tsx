"use client";

import { AppContext } from "@/components/app-provider";
// import ThreeGameBoard from "@/components/game-boards/three-game-board";
import { Button } from "@/components/ui/button";
import { GameEngine } from "@/lib/game-engine";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const appContext = useContext(AppContext);
  const [gameEngine] = useState(new GameEngine(appContext.settings));
  const [showModifierButton, setShowModifierButton] = useState(
    appContext.settings.modifierProbability === 0,
  );

  useEffect(() => {
    const settings = appContext!.settings;
    const messages = gameEngine.updateSettings(settings);
    if (messages.includes("history.cleared")) {
      toast("Category/modifier play history cleared");
    }
    setShowModifierButton(settings.modifierProbability === 0);
  }, [appContext.settings]);

  function nextTurn() {
    const challenge = gameEngine.nextTurn();
    console.log(challenge);
  }

  return (
    <div className="w-full h-full relative touch-none select-none">
      {/* <ThreeGameBoard /> */}
      <div className="absolute bottom-0 w-full flex justify-center px-4 gap-3">
        <Button
          className="grow h-12 md:h-8 md:flex-none w-28 mb-4"
          onClick={nextTurn}
        >
          Next turn
        </Button>
        {showModifierButton && (
          <Button
            variant="outline"
            className="grow h-12 md:h-8 md:flex-none w-28 mb-4"
            onClick={() => {}}
          >
            Add modifier
          </Button>
        )}
      </div>
    </div>
  );
}
