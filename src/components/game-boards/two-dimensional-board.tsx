"use client";

import { Challenge, Prompt } from "@/lib/game-engine";
import { cn, getRandomNumberInRange } from "@/lib/utils";
import { useState } from "react";
import Delayed from "../delayed";

export default function TwoDimensionalBoard({
  challenges,
}: Readonly<{ challenges: Challenge[] }>) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      {challenges.slice(-1).map((c) => (
        <div key={c.category.key} className="flex items-center">
          <Card
            prompt={c.category}
            className="animate-card-entrance -z-20 bg-gray-100 text-black"
          />
          {c.modifier && (
            <Delayed
              waitBeforeShow={500}
              waitingContent={<div className="w-80"></div>}
            >
              <Card
                prompt={c.modifier}
                className="animate-card-entrance -z-10 bg-stone-900 text-white"
              />
            </Delayed>
          )}
        </div>
      ))}
    </div>
  );
}

function Card({
  prompt,
  className,
}: Readonly<{ prompt: Prompt; className?: string }>) {
  const [rotation] = useState(getRandomNumberInRange(-2, 2));

  // declaring classes upfront so tailwind can genarte the necessary css
  const rotationClasses: Record<number, string> = {
    [-2]: "-rotate-2",
    [-1]: "-rotate-1",
    0: "rotate-0",
    1: "rotate-1",
    2: "rotate-2",
  };

  return (
    <div
      className={cn(
        className,
        "h-fit min-h-96 w-80 min-w-80 rounded-xl p-6 shadow-xl",
        rotationClasses[rotation] || "rotate-0",
      )}
    >
      <p className="mb-1 text-3xl font-semibold">{prompt.name}</p>
      <p
        className="text-xl font-medium"
        dangerouslySetInnerHTML={{ __html: prompt.description || "" }}
      ></p>
    </div>
  );
}
