"use client";

import { CircleHelp } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { RulesDialog } from "../rules/rules-dialog";

export function NavHowToPlay({ className }: Readonly<{ className?: string }>) {
  return (
    <SidebarGroup className={className}>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <RulesDialog>
              <SidebarMenuButton className="justify-center">
                <CircleHelp /> How to play
              </SidebarMenuButton>
            </RulesDialog>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
