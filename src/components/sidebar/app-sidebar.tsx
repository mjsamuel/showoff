import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";
import { NavPlayers } from "./sidebar-players";
import { NavGameSettings } from "./sidebar-settings";
import { NavHowToPlay } from "./sidebar-rules";
import { RoomDialog } from "../room/room-dialog";
import { useGame } from "@/hooks/use-game";
import type { RoomView } from "@/lib/room-protocol";

export function AppSidebar() {
  const { room, leaveRoom } = useGame();

  return (
    <Sidebar>
      <SidebarHeader>
        <h1 className="font-freckle my-2 flex justify-center text-3xl">
          Showoff
        </h1>
      </SidebarHeader>
      <SidebarContent>
        {room ? (
          <RoomControls room={room} onLeave={leaveRoom} />
        ) : (
          <div className="mx-4 my-3 flex gap-3">
            <RoomDialog mode="join">
              <Button className="grow">Join room</Button>
            </RoomDialog>
            <RoomDialog mode="create">
              <Button variant="outline" className="grow">
                Create room
              </Button>
            </RoomDialog>
          </div>
        )}
        <NavPlayers />
        <NavGameSettings />
        <NavHowToPlay className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  );
}

function RoomControls({
  room,
  onLeave,
}: Readonly<{ room: RoomView; onLeave: () => void }>) {
  const [confirmLeave, setConfirmLeave] = useState(false);

  const copyInvite = async () => {
    const url = `${window.location.origin}/room/${room.code}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("Invite link copied");
    } catch {
      toast(url);
    }
  };

  return (
    <div className="mx-4 my-3 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sidebar-foreground/70 text-xs">Room code</p>
          <p className="text-2xl font-semibold tracking-[0.2em]">{room.code}</p>
        </div>
        <Button variant="outline" size="sm" onClick={copyInvite}>
          <Copy /> Invite
        </Button>
      </div>
      <Button variant="outline" onClick={() => setConfirmLeave(true)}>
        Leave room
      </Button>
      <AlertDialog open={confirmLeave} onOpenChange={setConfirmLeave}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave room?</AlertDialogTitle>
            <AlertDialogDescription>
              You&rsquo;ll lose your seat and lives. You can rejoin with the
              room code while it&rsquo;s still open.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={onLeave}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
