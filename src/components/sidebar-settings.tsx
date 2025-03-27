"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { Checkbox } from "./ui/checkbox";
import { Slider } from "./ui/slider";
import React from "react";

function AppSidebarItem({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-hidden ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm">
      {children}
    </div>
  );
}

export function NavGameSettings() {
  const [repeat, setRepeat] = React.useState(false);
  const [modifiers, setModifiers] = React.useState(false);
  const [modifierProbability, setModifierProbability] = React.useState(25);
  const modifierLabel = React.useMemo(() => {
    if (modifierProbability === 0) {
      return "Player choice";
    }
    return `${modifierProbability}%`;
  }, [modifierProbability]);

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
            />
            <label htmlFor="repeat" className="grow">
              Repeat categories/modifiers
            </label>
          </AppSidebarItem>
          <AppSidebarItem>
            <Checkbox
              id="modifiers"
              checked={modifiers}
              onCheckedChange={(v) => setModifiers(v as boolean)}
            />
            <label htmlFor="modifiers" className="grow">
              Play with modifiers
            </label>
          </AppSidebarItem>
          <AppSidebarItem>
            <div className="flex flex-col gap-4 h-12 w-full px-1">
              <div className="flex items-center space-x-2">
                Modifier probability: {modifierLabel}
              </div>
              <Slider
                defaultValue={[50]}
                max={100}
                step={25}
                value={[modifierProbability]}
                onValueChange={(v) => setModifierProbability(v[0])}
                disabled={!modifiers}
              />
            </div>
          </AppSidebarItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
