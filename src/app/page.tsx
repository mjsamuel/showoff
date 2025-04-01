"use client";

import ThreeGameBoard from "@/components/game-boards/three-game-board";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="w-full h-full relative touch-none select-none">
      <ThreeGameBoard />
      <div className="absolute bottom-0 w-full flex justify-center">
        <Button className="mb-4">Next turn</Button>
      </div>
    </div>
  );
}
