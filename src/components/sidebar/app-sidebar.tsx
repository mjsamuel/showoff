import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import React from "react";
import { NavPlayers } from "./sidebar-players";
import { NavGameSettings } from "./sidebar-settings";
import { NavHowToPlay } from "./sidebar-rules";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <h1 className="mt-1 flex justify-center text-xl font-semibold">
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
        <NavPlayers />
        <NavGameSettings />
        <NavHowToPlay className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  );
}
