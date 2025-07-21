"use client";

import { Challenge, Prompt } from "@/lib/game-engine";
import { cn, getRandomNumberInRange } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import Delayed from "../delayed";
import { useIsMobile } from "@/hooks/use-mobile";

export default function TwoDimensionalBoard({
  challenges,
}: Readonly<{ challenges: Challenge[] }>) {
  const isMobile = useIsMobile();
  const cutChallenges = challenges.slice(isMobile ? -2 : -5);
  return (
    <div className="relative flex size-full items-center justify-center overflow-y-scroll">
      {cutChallenges.map((c, i) => (
        <ChallengeView
          challenge={c}
          key={c.slug}
          isMobile={isMobile}
          zIndex={cutChallenges.length - 1 - i}
        />
      ))}
    </div>
  );
}

// declaring classes upfront so tailwind can genarte the necessary css
const CHALLENGE_CLASS_BY_Z_INDEX: Record<
  number,
  { brightness: string; category: string; modifier: string }
> = {
  0: { brightness: "brightness-100", category: "z-8", modifier: "z-9" },
  1: { brightness: "brightness-50", category: "z-6", modifier: "z-7" },
  2: { brightness: "brightness-25", category: "z-4", modifier: "z-5" },
  3: { brightness: "brightness-12", category: "z-2", modifier: "z-3" },
  4: { brightness: "brightness-6", category: "z-0", modifier: "z-1" },
};
function ChallengeView({
  challenge,
  isMobile,
  zIndex,
}: Readonly<{
  challenge: Challenge;
  isMobile: boolean;
  zIndex: number;
}>) {
  const [categoryHeightOffset, setCategoryHeightOffset] = useState(0);
  const categoryCardRef = useRef<HTMLDivElement>(null);
  const categoryTextRef = useRef<HTMLDivElement>(null);

  // get the height of the category card and calculate the offset for
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
    const categoryMargin = 40;
    const offset = totalHeight - textHeight - categoryMargin;
    setCategoryHeightOffset((_) => offset);
  }, [challenge]);

  const classes = CHALLENGE_CLASS_BY_Z_INDEX[zIndex];

  return (
    <div
      className={cn(
        "absolute flex flex-col items-center md:flex-row",
        classes.brightness,
      )}
    >
      <Card
        ref={categoryCardRef}
        textRef={categoryTextRef}
        prompt={challenge.category}
        className={cn(
          "animate-card-fade-in min-h-96 w-80 min-w-80 rounded-xl bg-gray-100 text-black shadow-xl",
          classes.category,
        )}
        style={isMobile ? { marginBottom: -categoryHeightOffset } : {}}
      />
      {challenge.modifier && (
        <Delayed
          waitBeforeShow={500}
          waitingContent={<div className="h-96 w-80"></div>}
        >
          <Card
            prompt={challenge.modifier}
            className={cn(
              "animate-card-fade-in min-h-96 w-80 min-w-80 rounded-xl bg-stone-800 text-white shadow-xl",
              classes.modifier,
            )}
          />
        </Delayed>
      )}
    </div>
  );
}

const ROTATION_CLASSES: Record<number, string> = {
  [-2]: "-rotate-2",
  [-1]: "-rotate-1",
  0: "rotate-0",
  1: "rotate-1",
  2: "rotate-2",
};
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
