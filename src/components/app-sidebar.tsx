import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { NavGameSettings } from "./sidebar-settings";
import { NavPlayers } from "./sidebar-players";
import { NavHowToPlay } from "./sidebar-rules";
import React from "react";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <h1 className="flex justify-center text-xl font-semibold mt-1">
          Showoff
        </h1>
      </SidebarHeader>
      <SidebarContent>
        <div className="mx-4 my-3 flex gap-3">
          <Button className="grow">Join room</Button>
          <Button variant="outline" className="grow">
            Create room
          </Button>
        </div>
        <NavPlayers></NavPlayers>
        <NavGameSettings></NavGameSettings>
        <NavHowToPlay className="mt-auto"></NavHowToPlay>
      </SidebarContent>
    </Sidebar>
  );
}
