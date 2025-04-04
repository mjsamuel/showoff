"use client";

import { AppContext } from "@/components/app-provider";
import ThreeGameBoard from "@/components/game-boards/three-game-board";
import { Button } from "@/components/ui/button";
import { GameEngine, GameSettings } from "@/lib/game-engine";
import { useContext, useEffect } from "react";

export default function Home() {
  const appContext = useContext(AppContext);
  const gameEngine = new GameEngine({} as GameSettings);

  useEffect(() => {
    gameEngine.updateSettings(appContext!.settings);
  }, [appContext?.settings]);

  function nextTurn() {
    const challenge = gameEngine.nextTurn();
    console.log(challenge);
  }

  return (
    <div className="w-full h-full relative touch-none select-none">
      <ThreeGameBoard />
      <div className="absolute bottom-0 w-full flex justify-center px-4">
        <Button className="w-full md:w-fit mb-4" onClick={nextTurn}>
          Next turn
        </Button>
      </div>
    </div>
  );
}
