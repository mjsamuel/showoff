import { useEffect, useMemo, useState } from "react";
import { useAtom, useAtomSet, useAtomValue } from "@effect/atom-react";
import { toast } from "sonner";
import { canAddModifier, hasHistory } from "@/lib/game-logic";
import {
  addModifierAtom,
  addPlayerAtom,
  clampLives,
  gameAtom,
  nextTurnAtom,
  playersAtom,
  removePlayerAtom,
  renamePlayerAtom,
  setLivesAtom,
  settingsAtom,
  updateSettingsAtom,
} from "@/lib/store";
import {
  playerNameAtom,
  roomCodeAtom,
  roomSessionAtom,
  type RoomSession,
} from "@/lib/room-store";
import { MAX_NAME_LENGTH, type RoomView } from "@/lib/room-protocol";
import { GameContext, type Game } from "@/hooks/use-game";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Plays on this device, or in the room named by the URL
export function GameProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const roomCode = useAtomValue(roomCodeAtom);
  return roomCode ? (
    <RoomGame key={roomCode} code={roomCode}>
      {children}
    </RoomGame>
  ) : (
    <LocalGame>{children}</LocalGame>
  );
}

function LocalGame({ children }: Readonly<{ children: React.ReactNode }>) {
  const state = useAtomValue(gameAtom);
  const settings = useAtomValue(settingsAtom);
  const players = useAtomValue(playersAtom);
  const nextTurn = useAtomSet(nextTurnAtom);
  const addModifier = useAtomSet(addModifierAtom);
  const updateSettings = useAtomSet(updateSettingsAtom);
  const addPlayer = useAtomSet(addPlayerAtom);
  const removePlayer = useAtomSet(removePlayerAtom);
  const renamePlayer = useAtomSet(renamePlayerAtom);
  const setLives = useAtomSet(setLivesAtom);

  const game = useMemo<Game>(
    () => ({
      challenges: state.challenges,
      players,
      settings,
      canChangeSettings: true,
      canAddModifier: canAddModifier(state.challenges, settings),
      hasHistory: hasHistory(state.deck),
      nextTurn: () => nextTurn(),
      addModifier: () => addModifier(),
      updateSettings,
      setLives: (id, lives) => setLives({ id, lives }),
      roster: {
        add: () => addPlayer(),
        remove: removePlayer,
        rename: (id, name) => renamePlayer({ id, name }),
      },
      room: null,
      leaveRoom: () => {},
    }),
    [
      state,
      settings,
      players,
      nextTurn,
      addModifier,
      updateSettings,
      addPlayer,
      removePlayer,
      renamePlayer,
      setLives,
    ],
  );

  return <GameContext.Provider value={game}>{children}</GameContext.Provider>;
}

// Asks for a name first when arriving by link, then connects
function RoomGame({
  code,
  children,
}: Readonly<{ code: string; children: React.ReactNode }>) {
  const name = useAtomValue(playerNameAtom);
  const [joining, setJoining] = useState(name.trim().length > 0);

  return joining ? (
    <RoomSessionGame code={code} onRetry={() => setJoining(false)}>
      {children}
    </RoomSessionGame>
  ) : (
    <NamePrompt code={code} onJoin={() => setJoining(true)} />
  );
}

function RoomSessionGame({
  code,
  onRetry,
  children,
}: Readonly<{ code: string; onRetry: () => void; children: React.ReactNode }>) {
  const session = useAtomValue(roomSessionAtom(code));
  const exitRoom = useAtomSet(roomCodeAtom);
  const { status, view, endedReason } = session;
  useNotice(session);

  if (status === "ended") {
    return (
      <RoomMessage code={code} label="Room">
        <p className="text-muted-foreground text-sm">{endedReason}</p>
        <div className="flex flex-col gap-2">
          {endedReason !== "Left the room" && (
            <Button onClick={onRetry}>Try again</Button>
          )}
          <Button onClick={() => exitRoom(null)} variant="outline">
            Back to start
          </Button>
        </div>
      </RoomMessage>
    );
  }

  if (!view) {
    return (
      <RoomMessage code={code} label="Joining room">
        <p className="text-muted-foreground animate-pulse text-sm">
          Connecting...
        </p>
      </RoomMessage>
    );
  }

  return (
    <RoomGameContext session={session} view={view}>
      {children}
    </RoomGameContext>
  );
}

function RoomGameContext({
  session,
  view,
  children,
}: Readonly<{
  session: RoomSession;
  view: RoomView;
  children: React.ReactNode;
}>) {
  const { send } = session;
  const exitRoom = useAtomSet(roomCodeAtom);
  const game = useMemo<Game>(() => {
    const current = view.challenges.at(-1);
    return {
      challenges: view.challenges,
      players: view.players.map((p) => ({
        ...p,
        you: p.id === view.youId,
        host: p.id === view.hostId,
      })),
      settings: view.settings,
      canChangeSettings: view.youId === view.hostId,
      canAddModifier: canAddModifier(view.challenges, view.settings),
      hasHistory: view.hasHistory,
      nextTurn: () => send({ _tag: "NextTurn", after: current?.slug ?? null }),
      addModifier: () => {
        if (current) send({ _tag: "AddModifier", slug: current.slug });
      },
      updateSettings: (patch) => send({ _tag: "UpdateSettings", patch }),
      setLives: (playerId, lives) =>
        send({ _tag: "SetLives", playerId, lives: clampLives(lives) }),
      roster: null,
      room: view,
      leaveRoom: () => {
        send({ _tag: "Leave" });
        exitRoom(null);
      },
    };
  }, [view, send, exitRoom]);

  return (
    <GameContext.Provider value={game}>
      {session.status === "connecting" && (
        <p className="bg-secondary text-muted-foreground fixed top-4 left-1/2 z-50 -translate-x-1/2 animate-pulse rounded-full px-3 py-1.5 text-xs font-medium">
          Reconnecting...
        </p>
      )}
      {children}
    </GameContext.Provider>
  );
}

// Shows why the room refused an action
function useNotice(session: RoomSession) {
  const notice = session.notice;
  useEffect(() => {
    if (notice) toast.error(notice.reason);
  }, [notice]);
}

function NamePrompt({
  code,
  onJoin,
}: Readonly<{ code: string; onJoin: () => void }>) {
  const [name, setName] = useAtom(playerNameAtom);
  const exitRoom = useAtomSet(roomCodeAtom);
  const canJoin = name.trim().length > 0;

  return (
    <RoomMessage code={code} label="Joining room">
      <Input
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && canJoin && onJoin()}
        maxLength={MAX_NAME_LENGTH}
        autoFocus
      />
      <div className="flex flex-col gap-2">
        <Button onClick={onJoin} disabled={!canJoin}>
          Join room
        </Button>
        <Button
          onClick={() => exitRoom(null)}
          variant="ghost"
          className="text-muted-foreground"
        >
          Back
        </Button>
      </div>
    </RoomMessage>
  );
}

function RoomMessage({
  code,
  label,
  children,
}: Readonly<{ code: string; label: string; children: React.ReactNode }>) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="flex w-full max-w-xs flex-col gap-6 text-center">
        <div>
          <p className="text-muted-foreground text-sm">{label}</p>
          <h1 className="font-freckle text-6xl tracking-[0.15em]">{code}</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
