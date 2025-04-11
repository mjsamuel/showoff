"use client";

import { Challenge, Prompt } from "@/lib/game-engine";
import { cn, getRandomNumberInRange } from "@/lib/utils";
import { useState } from "react";

export default function TwoDimensionalBoard({
  challenges,
}: Readonly<{ challenges: Challenge[] }>) {
  return (
    <div className="relative flex h-full w-full items-center justify-center gap-4 p-4">
      {challenges.map((c) => (
        <div key={c.category.key} className="absolute">
          <Card
            prompt={c.category}
            className="animate-card-entrance bg-gray-100 text-black"
          />
        </div>
      ))}
    </div>
  );
}

function Card({
  prompt,
  className,
}: Readonly<{ prompt: Prompt; className?: string }>) {
  const [rotation] = useState(getRandomNumberInRange(-3, 3));

  // declaring classes upfront so tailwind can genarte the necessary css
  const rotationClasses: Record<number, string> = {
    [-3]: "-rotate-3",
    [-2]: "-rotate-2",
    [-1]: "-rotate-1",
    0: "rotate-0",
    1: "rotate-1",
    2: "rotate-2",
    3: "rotate-3",
  };

  return (
    <div
      className={cn(
        className,
        "static h-fit min-h-96 w-80 rounded-xl p-6 shadow-xl",
        rotationClasses[rotation],
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
