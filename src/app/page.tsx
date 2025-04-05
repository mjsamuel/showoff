"use client";

import { AppContext } from "@/components/app-provider";
import ThreeGameBoard from "@/components/game-boards/three-game-board";
import { Button } from "@/components/ui/button";
import { GameEngine } from "@/lib/game-engine";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const appContext = useContext(AppContext);
  const [gameEngine] = useState(new GameEngine(appContext.settings));

  useEffect(() => {
    const messages = gameEngine.updateSettings(appContext!.settings);
    if (messages.includes("history.cleared")) {
      toast("Category/modifier play history cleared");
    }
  }, [appContext.settings]);

  function nextTurn() {
    const challenge = gameEngine.nextTurn();
  }

  return (
    <div className="w-full h-full relative touch-none select-none">
      {/* <ThreeGameBoard /> */}
      <div className="absolute bottom-0 w-full flex justify-center px-4">
        <Button className="w-full md:w-fit mb-4" onClick={nextTurn}>
          Next turn
        </Button>
      </div>
    </div>
  );
}
