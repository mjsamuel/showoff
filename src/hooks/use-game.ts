import { createContext, useContext } from "react";
import type { RoomView } from "@/lib/room-protocol";
import type { Challenge, GameSettings } from "@/lib/types";

export interface GamePlayer {
  // Seat id in a room
  readonly id: string;
  readonly name: string;
  readonly lives: number;
  // Rooms only: whether the player's phone is connected, and whether it's this one
  readonly connected?: boolean;
  readonly you?: boolean;
  readonly host?: boolean;
}

// One game, whether it's played on this device or in a room
export interface Game {
  // Oldest first
  readonly challenges: ReadonlyArray<Challenge>;
  readonly players: ReadonlyArray<GamePlayer>;
  readonly settings: GameSettings;
  readonly canChangeSettings: boolean;
  readonly canAddModifier: boolean;
  // Whether turning repeats on clears the play history
  readonly hasHistory: boolean;
  readonly nextTurn: () => void;
  readonly addModifier: () => void;
  readonly updateSettings: (patch: Partial<GameSettings>) => void;
  readonly setLives: (playerId: string, lives: number) => void;
  // Only on this device: a room's players are whoever has joined
  readonly roster: {
    readonly add: () => void;
    readonly remove: (playerId: string) => void;
    readonly rename: (playerId: string, name: string) => void;
  } | null;
  readonly room: RoomView | null;
  // Gives up this device's seat and goes back to playing locally
  readonly leaveRoom: () => void;
}

export const GameContext = createContext<Game | null>(null);

export function useGame() {
  const game = useContext(GameContext);
  if (!game) throw new Error("useGame must be used inside a GameProvider");
  return game;
}
