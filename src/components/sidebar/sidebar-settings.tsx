import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { Checkbox } from "../ui/checkbox";
import { Slider } from "../ui/slider";
import { useState } from "react";
import { toast } from "sonner";
import { useGame } from "@/hooks/use-game";

export function NavGameSettings() {
  const { settings, updateSettings, canChangeSettings, hasHistory } = useGame();
  const [prevProbability, setPrevProbability] = useState(
    settings.modifierProbability,
  );
  const [preCommitProbability, setPreCommitProbability] = useState(
    settings.modifierProbability,
  );

  const { repeat, modifiers } = settings;
  // Follow changes made elsewhere, e.g. by a room's host
  if (prevProbability !== settings.modifierProbability) {
    setPrevProbability(settings.modifierProbability);
    setPreCommitProbability(settings.modifierProbability);
  }
  const toggleRepeat = () => {
    if (!repeat && hasHistory) toast("Category/modifier play history cleared");
    updateSettings({ repeat: !repeat });
  };
  const probabilityLabel =
    preCommitProbability === 0 ? "Player choice" : `${preCommitProbability}%`;

  return (
    <SidebarGroup className="select-none">
      <SidebarGroupLabel>Game settings</SidebarGroupLabel>
      <SidebarGroupContent>
        {!canChangeSettings && (
          <p className="text-sidebar-foreground/70 mb-1 px-2 text-xs">
            Only the host can change settings
          </p>
        )}
        <SidebarMenu>
          {/* Repeat checkbox */}
          <AppSidebarItem
            className="hover:cursor-pointer"
            disabled={!canChangeSettings}
            onClick={(e) => {
              e.stopPropagation();
              toggleRepeat();
            }}
          >
            <Checkbox id="repeat" checked={repeat} />
            <span>Repeat categories/modifiers</span>
          </AppSidebarItem>
          {/* Modifiers checkbox */}
          <AppSidebarItem
            className="hover:cursor-pointer"
            disabled={!canChangeSettings}
            onClick={(e) => {
              e.stopPropagation();
              updateSettings({ modifiers: !modifiers });
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
                onValueCommit={(v) => {
                  // Show the saved value until the change comes back, so a room
                  // update that's dropped or refused doesn't look applied
                  setPreCommitProbability(settings.modifierProbability);
                  updateSettings({ modifierProbability: v[0] });
                }}
                disabled={!modifiers || !canChangeSettings}
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
  disabled,
  onClick,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}>) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      className={`${className} peer/menu-button ring-sidebar-ring active:bg-sidebar-accent active:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:font-medium [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0`}
    >
      {children}
    </div>
  );
}
