"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { Checkbox } from "../ui/checkbox";
import { Slider } from "../ui/slider";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppContext, DEFAULT_GAME_SETTINGS } from "../app-provider";
import { Skeleton } from "../ui/skeleton";

export function NavGameSettings() {
  const { state, setSettings } = useContext(AppContext);

  const [repeat, setRepeat] = useState(DEFAULT_GAME_SETTINGS.repeat);
  const [modifiers, setModifiers] = useState(DEFAULT_GAME_SETTINGS.modifiers);
  const [probability, setProbability] = useState(
    DEFAULT_GAME_SETTINGS.modifierProbability,
  );
  const [preCommitProbability, setPreCommitProbability] = useState(
    DEFAULT_GAME_SETTINGS.modifierProbability,
  );
  const probabilityLabel = useMemo(() => {
    if (preCommitProbability === 0) {
      return "Player choice";
    }
    return `${preCommitProbability}%`;
  }, [preCommitProbability]);

  useEffect(() => {
    if (state.status !== "ready") return;
    const { repeat, modifiers, modifierProbability } = state.settings;

    setRepeat(repeat);
    setModifiers(modifiers);
    setPreCommitProbability(modifierProbability);
    setProbability(modifierProbability);
  }, [state]);

  const settingsRef = useRef({ repeat, modifiers, probability });
  useEffect(() => {
    if (state.status !== "ready") return;

    const prev = settingsRef.current;
    const current = { repeat, modifiers, probability };
    const hasChanged =
      current.repeat !== prev.repeat ||
      current.modifiers !== prev.modifiers ||
      current.probability !== prev.probability;
    if (!hasChanged) return;
    settingsRef.current = current;

    setSettings({
      repeat,
      modifiers,
      modifierProbability: probability,
    });
  }, [repeat, modifiers, probability, state.status, setSettings]);

  if (state.status !== "ready") {
    return (
      <SidebarGroup className="select-none">
        <SidebarGroupLabel>Game settings</SidebarGroupLabel>
        <Skeleton className="h-34" />
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup className="select-none">
      <SidebarGroupLabel>Game settings</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {/* Repeat checkbox */}
          <AppSidebarItem
            className="hover:cursor-pointer"
            onClick={() => setRepeat(!repeat)}
          >
            <Checkbox
              id="repeat"
              checked={repeat}
              onCheckedChange={(v) => setRepeat(v as boolean)}
            />
            <span>Repeat categories/modifiers</span>
          </AppSidebarItem>
          {/* Modifiers checkbox */}
          <AppSidebarItem
            className="hover:cursor-pointer"
            onClick={() => setModifiers(!modifiers)}
          >
            <Checkbox
              id="modifiers"
              checked={modifiers}
              onCheckedChange={(v) => setModifiers(v as boolean)}
            />
            <span>Play with modifiers</span>
          </AppSidebarItem>
          {/* Modifier probability slider */}
          <AppSidebarItem>
            <div className="flex h-12 w-full flex-col gap-4 px-1">
              <div className="flex items-center space-x-2">
                Modifier probability: {probabilityLabel}
              </div>
              <Slider
                defaultValue={[50]}
                max={100}
                step={25}
                value={[preCommitProbability]}
                onValueChange={(v) => setPreCommitProbability(v[0])}
                onValueCommit={(v) => setProbability(v[0])}
                disabled={!modifiers}
              />
            </div>
          </AppSidebarItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function AppSidebarItem({
  children,
  className,
  onClick,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}>) {
  return (
    <div
      onClick={onClick}
      className={`${className} peer/menu-button ring-sidebar-ring active:bg-sidebar-accent active:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:font-medium [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0`}
    >
      {children}
    </div>
  );
}
