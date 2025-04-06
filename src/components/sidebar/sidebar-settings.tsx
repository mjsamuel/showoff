"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { Checkbox } from "../ui/checkbox";
import { Slider } from "../ui/slider";
import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../app-provider";

export function NavGameSettings() {
  const { settings, setSettings } = useContext(AppContext);
  const [repeat, setRepeat] = useState(settings.repeat);
  const [modifiers, setModifiers] = useState(settings.modifiers);
  const [probability, setProbability] = useState(settings.modifierProbability);
  const [preCommitProbability, setPreCommitProbability] = useState(
    settings.modifierProbability,
  );
  const probabilityLabel = useMemo(() => {
    if (preCommitProbability === 0) {
      return "Player choice";
    }
    return `${preCommitProbability}%`;
  }, [preCommitProbability]);

  // settings begin with default values and pop-in once reading from local storage
  useEffect(() => {
    const { repeat, modifiers, modifierProbability } = settings;
    setRepeat(repeat);
    setModifiers(modifiers);
    setPreCommitProbability(modifierProbability);
    setProbability(modifierProbability);
  }, [settings]);

  useEffect(
    () =>
      setSettings({
        repeat,
        modifiers,
        modifierProbability: probability,
      }),
    [repeat, modifiers, probability],
  );

  return (
    <SidebarGroup className="select-none">
      <SidebarGroupLabel>Game settings</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <AppSidebarItem>
            <Checkbox
              id="repeat"
              checked={repeat}
              onCheckedChange={(v) => setRepeat(v as boolean)}
              className=" hover:cursor-pointer"
            />
            <label htmlFor="repeat" className="grow hover:cursor-pointer">
              Repeat categories/modifiers
            </label>
          </AppSidebarItem>
          <AppSidebarItem>
            <Checkbox
              id="modifiers"
              checked={modifiers}
              onCheckedChange={(v) => setModifiers(v as boolean)}
              className=" hover:cursor-pointer"
            />
            <label htmlFor="modifiers" className="grow hover:cursor-pointer">
              Play with modifiers
            </label>
          </AppSidebarItem>
          <AppSidebarItem>
            <div className="flex flex-col gap-4 h-12 w-full px-1">
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

function AppSidebarItem({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-hidden ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm">
      {children}
    </div>
  );
}
