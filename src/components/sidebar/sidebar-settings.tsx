"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { Checkbox } from "../ui/checkbox";
import { Slider } from "../ui/slider";
import { useContext, useState } from "react";
import { SettingsContext } from "../settings-provider";
import { Skeleton } from "../ui/skeleton";

export function NavGameSettings() {
  const [settings, setSettings] = useContext(SettingsContext);
  const [prevSettings, setPrevSettings] = useState(settings);
  const [preCommitProbability, setPreCommitProbability] = useState(0);

  if (settings.status !== "ready") {
    return (
      <SidebarGroup className="select-none">
        <SidebarGroupLabel>Game settings</SidebarGroupLabel>
        <Skeleton className="h-34" />
      </SidebarGroup>
    );
  }

  const repeat = settings.settings.repeat;
  const modifiers = settings.settings.modifiers;
  if (prevSettings !== settings) {
    setPrevSettings(settings);
    setPreCommitProbability(settings.settings.modifierProbability);
  }
  const probabilityLabel =
    preCommitProbability === 0 ? "Player choice" : `${preCommitProbability}%`;

  return (
    <SidebarGroup className="select-none">
      <SidebarGroupLabel>Game settings</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {/* Repeat checkbox */}
          <AppSidebarItem
            className="hover:cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setSettings({ ...settings.settings, repeat: !repeat });
            }}
          >
            <Checkbox id="repeat" checked={repeat} />
            <span>Repeat categories/modifiers</span>
          </AppSidebarItem>
          {/* Modifiers checkbox */}
          <AppSidebarItem
            className="hover:cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setSettings({ ...settings.settings, modifiers: !modifiers });
            }}
          >
            <Checkbox id="modifiers" checked={modifiers} />
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
                onValueCommit={(v) =>
                  setSettings({
                    ...settings.settings,
                    modifierProbability: v[0],
                  })
                }
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
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
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
