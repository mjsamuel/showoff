import { Crown, Plus, User, UserMinus, Heart } from "lucide-react";
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
import { MAX_LIVES } from "@/lib/types";

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
            className="grow"
            defaultValue={player.name}
            ref={nameInputRef}
            onKeyDown={onInputKeyDown}
            onChange={(e) => onRename(e.target.value)}
          />
        ) : (
          <span
            className={cn(
              "grow truncate",
              player.connected === false && "text-sidebar-foreground/50",
            )}
          >
            {player.name}
            {player.you && (
              <span className="text-sidebar-foreground/70"> (you)</span>
            )}
          </span>
        )}
        {!isMobile && (
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
  function incrementLives() {
    if (lives < MAX_LIVES) onChange(1);
  }

  function decrementLives() {
    if (lives > 0) onChange(-1);
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
