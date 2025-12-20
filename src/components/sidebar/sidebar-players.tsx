"use client";

import { Plus, User, UserMinus, Heart } from "lucide-react";
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

type Player = {
  name: string;
  lives: number;
};

export function NavPlayers({ className }: Readonly<{ className?: string }>) {
  const [players, setPlayers] = useState<Player[]>([
    { name: "Player 1", lives: 3 },
  ]);

  function addUser() {
    setPlayers([
      ...players,
      {
        name: `Player ${players.length + 1}`,
        lives: 3,
      },
    ]);
  }

  function deleteUser(index: number) {
    setPlayers(players.filter((_, i) => i !== index));
  }

  function onPlayerChange(changedPlayer: Player) {
    const nextPlayers = players.map((p) => {
      if (p.name === changedPlayer.name) return changedPlayer;
      return p;
    });
    setPlayers(nextPlayers);
  }

  return (
    <SidebarGroup className={className}>
      <SidebarGroupLabel>Players</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {players.map((player, index) => (
            <PlayerMenuItem
              key={index + player.name}
              player={player}
              onDelete={() => deleteUser(index)}
              onChange={onPlayerChange}
            />
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-sidebar-foreground/70 hover:cursor-pointer"
              onClick={addUser}
            >
              <Plus /> Add player
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function PlayerMenuItem({
  player,
  onDelete,
  onChange,
}: Readonly<{
  player: Player;
  onDelete?: () => void;
  onChange: (player: Player) => void;
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
        <input
          type="text"
          className="grow"
          defaultValue={player.name}
          ref={nameInputRef}
          onKeyDown={onInputKeyDown}
          onChange={(e) => onChange({ ...player, name: e.target.value })}
        />
        {!isMobile && (
          <LifeCounter
            lives={player.lives}
            onChange={(lives) => onChange({ ...player, lives })}
          />
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
  onChange: (lives: number) => void;
}>) {
  function incrementLives() {
    onChange(Math.min(lives + 1, 50));
  }

  function decrementLives() {
    onChange(Math.max(lives - 1, 0));
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
