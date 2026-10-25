import TwoDimensionalBoard from "@/components/game-boards/two-dimensional-board";
import { Button } from "@/components/ui/button";
import { useGame } from "@/hooks/use-game";

export function Board() {
  const game = useGame();
  const showModifierButton =
    game.settings.modifiers && game.settings.modifierProbability === 0;

  return (
    <div className="relative size-full">
      {game.challenges.length > 0 ? (
        <TwoDimensionalBoard challenges={game.challenges} />
      ) : (
        <div className="text-muted-foreground flex size-full items-center justify-center p-12 text-center">
          Hit &lsquo;Next turn&rsquo; to draw the first category
        </div>
      )}
      <div className="absolute bottom-0 z-50 mb-5 flex h-14 w-full justify-center gap-3 px-12 md:h-10">
        <Button
          className="h-full w-28 grow md:flex-none"
          onClick={game.nextTurn}
        >
          Next turn
        </Button>
        {showModifierButton && (
          <Button
            variant="secondary"
            className="h-full w-28 grow md:flex-none"
            onClick={game.addModifier}
            disabled={!game.canAddModifier}
          >
            Add modifier
          </Button>
        )}
      </div>
    </div>
  );
}
