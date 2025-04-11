"use client";

import { Challenge, Prompt } from "@/lib/game-engine";
import { cn, getRandomNumberInRange } from "@/lib/utils";
import { useState } from "react";

export default function TwoDimensionalBoard({
  challenges,
}: Readonly<{ challenges: Challenge[] }>) {
  return (
    <div className="w-full h-full justify-center flex items-center gap-4 p-4">
      {challenges.map((c, index) => (
        <Card
          key={index}
          prompt={c.category}
          className="bg-gray-100 text-black"
        />
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
        "h-fit p-6 static min-h-96 w-80 rounded-xl shadow-xl",
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
