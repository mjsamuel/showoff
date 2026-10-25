import { useState } from "react";
import { useAtom, useAtomSet } from "@effect/atom-react";
import { Schema } from "effect";
import {
  createRoom,
  normalizeRoomCode,
  playerNameAtom,
  roomCodeAtom,
  RoomCreationLimited,
} from "@/lib/room-store";
import {
  MAX_NAME_LENGTH,
  RoomCode,
  ROOM_CODE_LENGTH,
} from "@/lib/room-protocol";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const isRoomCode = Schema.is(RoomCode);

// Pick a name, then host a new room or join one by its code
export function RoomDialog({
  mode,
  children,
}: Readonly<{ mode: "create" | "join"; children: React.ReactNode }>) {
  const [name, setName] = useAtom(playerNameAtom);
  const enterRoom = useAtomSet(roomCodeAtom);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedCode = normalizeRoomCode(code);
  const canSubmit =
    name.trim().length > 0 &&
    !busy &&
    (mode === "create" || normalizedCode.length === ROOM_CODE_LENGTH);

  const submit = async () => {
    if (!canSubmit) return;
    setError(null);
    if (mode === "join") {
      if (isRoomCode(normalizedCode)) enterRoom(normalizedCode);
      else setError("Room codes are 4 letters, like KQBT");
      return;
    }
    setBusy(true);
    try {
      enterRoom(await createRoom());
    } catch (e) {
      setError(
        e instanceof RoomCreationLimited
          ? e.message
          : "Couldn't create a room. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog onOpenChange={() => setError(null)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create a room" : "Join a room"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Everyone joins on their own device and sees the same cards. You pick the settings."
              : "Enter the 4-letter code from the host's screen."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={MAX_NAME_LENGTH}
            autoFocus
          />
          {mode === "join" && (
            <Input
              placeholder="Room code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="font-semibold tracking-[0.3em] uppercase placeholder:tracking-normal placeholder:normal-case"
              maxLength={ROOM_CODE_LENGTH}
              autoCapitalize="characters"
              autoComplete="off"
            />
          )}
          {error && <p className="text-destructive text-sm">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={!canSubmit}>
              {mode === "join"
                ? "Join room"
                : busy
                  ? "Creating..."
                  : "Create room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
