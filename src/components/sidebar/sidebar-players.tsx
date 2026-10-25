import { Crown, Heart, Minus, Plus, User, UserMinus } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGame, type GamePlayer } from "@/hooks/use-game";
import { cn } from "@/lib/utils";

export function NavPlayers({ className }: Readonly<{ className?: string }>) {
  const { players, roster, changeLives } = useGame();

  return (
    <SidebarGroup className={className}>
      <SidebarGroupLabel>Players</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {players.map((player) => (
            <PlayerMenuItem
              key={player.id}
              player={player}
              onDelete={roster ? () => roster.remove(player.id) : undefined}
              onRename={
                roster ? (name) => roster.rename(player.id, name) : undefined
              }
              onLivesChange={(delta) => changeLives(player.id, delta)}
            />
          ))}
          {roster && (
            <SidebarMenuItem>
              <SidebarMenuButton
                className="text-sidebar-foreground/70 hover:cursor-pointer"
                onClick={roster.add}
              >
                <Plus /> Add player
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function PlayerMenuItem({
  player,
  onDelete,
  onRename,
  onLivesChange,
}: Readonly<{
  player: GamePlayer;
  // Only for players on this device; a room's players name themselves
  onDelete?: () => void;
  onRename?: (name: string) => void;
  onLivesChange: (delta: number) => void;
}>) {
  const isMobile = useIsMobile();
  const [isHovered, setIsHovered] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === "Escape") {
      nameInputRef.current?.blur();
    }
  }

  return (
    <SidebarMenuItem>
      <div className="hover:bg-sidebar-accent flex w-full flex-row items-center gap-2 rounded-md p-2">
        {onDelete ? (
          <span
            onClick={onDelete}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="size-5 hover:cursor-pointer"
          >
            {!isHovered ? (
              <User className="size-5" />
            ) : (
              <UserMinus className="size-5" />
            )}
          </span>
        ) : player.host ? (
          <Crown className="size-5" aria-label="Host" />
        ) : (
          <User className="size-5" />
        )}
        {onRename ? (
          <input
            type="text"
            className="min-w-0 grow"
            defaultValue={player.name}
            ref={nameInputRef}
            onKeyDown={onInputKeyDown}
            onChange={(e) => onRename(e.target.value)}
          />
        ) : (
          <span
            className={cn(
              "min-w-0 grow truncate",
              player.connected === false && "text-sidebar-foreground/50",
            )}
          >
            {player.name}
            {player.you && (
              <span className="text-sidebar-foreground/70"> (you)</span>
            )}
          </span>
        )}
        {isMobile ? (
          <TouchLifeCounter lives={player.lives} onChange={onLivesChange} />
        ) : (
          <LifeCounter lives={player.lives} onChange={onLivesChange} />
        )}
      </div>
    </SidebarMenuItem>
  );
}

function LifeCounter({
  lives,
  onChange,
}: Readonly<{
  lives: number;
  onChange: (delta: number) => void;
}>) {
  // No bounds check here: `lives` can lag behind the room, which clamps instead
  function incrementLives() {
    onChange(1);
  }

  function decrementLives() {
    onChange(-1);
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <span
          className="flex flex-row items-center gap-1"
          onClick={incrementLives}
          onContextMenu={(e) => {
            e.preventDefault();
            decrementLives();
          }}
        >
          <Heart className="size-4" />
          <span>{lives}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          Left click: +1 life
          <br />
          Right click: -1 life
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

// Phones have no right-click or hover, so lives get their own buttons
function TouchLifeCounter({
  lives,
  onChange,
}: Readonly<{
  lives: number;
  onChange: (delta: number) => void;
}>) {
  return (
    <span className="flex shrink-0 flex-row items-center">
      <button
        type="button"
        aria-label="Lose a life"
        className="active:bg-sidebar-accent flex size-8 items-center justify-center rounded-md"
        onClick={() => onChange(-1)}
      >
        <Minus className="size-4" />
      </button>
      <span className="flex min-w-9 flex-row items-center justify-center gap-1">
        <Heart className="size-4" />
        <span>{lives}</span>
      </span>
      <button
        type="button"
        aria-label="Gain a life"
        className="active:bg-sidebar-accent flex size-8 items-center justify-center rounded-md"
        onClick={() => onChange(1)}
      >
        <Plus className="size-4" />
      </button>
    </span>
  );
}
