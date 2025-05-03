"use client";

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
import { toast } from "sonner";

export function AppSidebar() {
  const handleClick = () => toast("Coming soon!");

  return (
    <Sidebar>
      <SidebarHeader>
        <h1 className="font-freckle my-2 flex justify-center text-3xl">
          Showoff
        </h1>
      </SidebarHeader>
      <SidebarContent>
        <div className="mx-4 my-3 flex gap-3">
          <Button className="grow" onClick={handleClick}>
            Join room
          </Button>
          <Button variant="outline" className="grow" onClick={handleClick}>
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
