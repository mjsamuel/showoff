"use client";

import { Challenge, Prompt } from "@/lib/game-engine";
import { cn, getRandomNumberInRange } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import Delayed from "../delayed";
import { useIsMobile } from "@/hooks/use-mobile";

// declaring classes upfront so tailwind can genarte the necessary css
const ROTATION_CLASSES: Record<number, string> = {
  [-2]: "-rotate-2",
  [-1]: "-rotate-1",
  0: "rotate-0",
  1: "rotate-1",
  2: "rotate-2",
};
const BRIGHTNESS_CLASSES: Record<number, string> = {
  0: "brightness-100",
  1: "brightness-50",
  2: "brightness-25",
  3: "brightness-12",
  4: "brightness-6",
};
const Z_INDEX_CLASSES: Record<number, string> = {
  0: "-z-20",
  1: "-z-22",
  2: "-z-24",
  3: "-z-26",
  4: "-z-28",
};

export default function TwoDimensionalBoard({
  challenges,
}: Readonly<{ challenges: Challenge[] }>) {
  const isMobile = useIsMobile();
  const cutChallenges = challenges.slice(-5);
  return (
    <div className="relative flex size-full items-center justify-center overflow-y-scroll">
      {cutChallenges.map((c, i) => (
        <ChallengeView
          challenge={c}
          key={c.slug}
          isMobile={isMobile}
          opacityClass={BRIGHTNESS_CLASSES[cutChallenges.length - 1 - i]}
          zIndexClass={Z_INDEX_CLASSES[cutChallenges.length - 1 - i]}
        />
      ))}
    </div>
  );
}

function ChallengeView({
  challenge,
  isMobile,
  opacityClass,
  zIndexClass,
}: Readonly<{
  challenge: Challenge;
  isMobile: boolean;
  opacityClass: string;
  zIndexClass: string;
}>) {
  const [categoryHeightOffset, setCategoryHeightOffset] = useState(0);
  const categoryCardRef = useRef<HTMLDivElement>(null);
  const categoryTextRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (
      !challenge.modifier ||
      !categoryCardRef.current ||
      !categoryCardRef.current
    ) {
      return;
    }
    const totalHeight = categoryCardRef.current?.offsetHeight || 0;
    const textHeight = categoryTextRef.current?.offsetHeight || 0;
    const padding = 35;
    const offset = totalHeight - textHeight - padding;
    setCategoryHeightOffset((_) => offset);
  }, [challenge]);

  return (
    <div
      className={cn(
        "absolute m-auto flex flex-col items-center md:flex-row",
        opacityClass,
        zIndexClass,
      )}
    >
      <Card
        ref={categoryCardRef}
        textRef={categoryTextRef}
        prompt={challenge.category}
        className="animate-card-fade-in min-h-96 w-80 min-w-80 rounded-xl bg-gray-100 text-black shadow-xl"
        style={isMobile ? { marginBottom: -categoryHeightOffset } : {}}
      />
      {challenge.modifier && (
        <Delayed
          waitBeforeShow={500}
          waitingContent={<div className="h-96 w-80"></div>}
        >
          <Card
            prompt={challenge.modifier}
            className="animate-card-fade-in min-h-96 w-80 min-w-80 rounded-xl bg-stone-800 text-white shadow-xl"
          />
        </Delayed>
      )}
    </div>
  );
}

function Card({
  ref,
  textRef,
  prompt,
  className,
  style,
}: Readonly<{
  ref?: React.Ref<HTMLDivElement>;
  textRef?: React.Ref<HTMLDivElement>;
  style?: React.CSSProperties;
  className?: string;
  prompt: Prompt;
}>) {
  const [rotation] = useState(getRandomNumberInRange(-2, 2));

  return (
    <div
      ref={ref}
      style={style}
      className={cn(
        "h-fit w-fit p-6",
        ROTATION_CLASSES[rotation || 0],
        className,
      )}
    >
      <div ref={textRef}>
        <p className="mb-2 text-3xl font-semibold">{prompt.name}</p>
        <p
          className="text-xl font-medium"
          dangerouslySetInnerHTML={{ __html: prompt.description || "" }}
        ></p>
      </div>
    </div>
  );
}
