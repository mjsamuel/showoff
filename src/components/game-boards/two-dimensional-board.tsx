"use client";

import { Challenge, Prompt } from "@/lib/game-engine";
import { cn, getRandomNumberInRange } from "@/lib/utils";
import { useState } from "react";
import Delayed from "../delayed";
import { useIsMobile } from "@/hooks/use-mobile";

export default function TwoDimensionalBoard({
  challenges,
}: Readonly<{ challenges: Challenge[] }>) {
  const isMobile = useIsMobile();

  return (
    <div className="flex size-full">
      {isMobile ? (
        <SmallScreenBoard challenges={challenges} />
      ) : (
        <LargeScreenBoard challenges={challenges} />
      )}
    </div>
  );
}

function LargeScreenBoard({
  challenges,
}: Readonly<{ challenges: Challenge[] }>) {
  return challenges.slice(-1).map((c) => (
    <div key={c.category.key} className="m-auto flex flex-row items-center">
      <Card
        prompt={c.category}
        className="animate-card-fade-in -z-20 min-h-96 w-80 min-w-80 rounded-xl bg-gray-100 text-black shadow-xl"
        rotate
      />
      {c.modifier && (
        <Delayed
          waitBeforeShow={500}
          waitingContent={<div className="h-96 w-80"></div>}
        >
          <Card
            prompt={c.modifier}
            className="animate-card-fade-in -z-10 min-h-96 w-80 min-w-80 rounded-xl bg-stone-800 text-white shadow-xl"
            rotate
          />
        </Delayed>
      )}
    </div>
  ));
}

function SmallScreenBoard({
  challenges,
}: Readonly<{ challenges: Challenge[] }>) {
  return challenges.slice(-1).map((c) => (
    <div key={c.category.key} className="mx-8 size-full overflow-hidden">
      <div className="animate-card-slide-in flex size-full flex-col rounded-t-2xl bg-gray-100 shadow-xl">
        <Card
          prompt={c.category}
          className="z-10 w-full rounded-t-2xl bg-gray-100 text-black"
        />
        {c.modifier && (
          <Delayed waitBeforeShow={500}>
            <Card
              prompt={c.modifier}
              className="animate-card-slide-in z-20 size-full rounded-t-2xl bg-stone-800 text-white shadow-xl"
            />
          </Delayed>
        )}
      </div>
    </div>
  ));
}

function Card({
  prompt,
  className,
  rotate = false,
}: Readonly<{ prompt: Prompt; className?: string; rotate?: boolean }>) {
  const [rotation] = useState(rotate && getRandomNumberInRange(-2, 2));

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
        "h-fit w-fit p-6",
        rotationClasses[rotation || 0],
        className,
      )}
    >
      <p className="mb-2 text-3xl font-semibold">{prompt.name}</p>
      <p
        className="text-xl font-medium"
        dangerouslySetInnerHTML={{ __html: prompt.description || "" }}
      ></p>
    </div>
  );
}
