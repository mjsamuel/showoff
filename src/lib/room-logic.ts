import { Data, Effect } from "effect";
import {
  addModifier,
  emptyGame,
  hasHistory,
  nextTurn,
  updateSettings,
} from "./game-logic";
import {
  MAX_NAME_LENGTH,
  MAX_ROOM_PLAYERS,
  VIEW_CHALLENGES,
  type ClientMessage,
  type RoomView,
} from "./room-protocol";
import {
  DEFAULT_SETTINGS,
  STARTING_LIVES,
  type GameSettings,
  type GameState,
} from "./types";

// Pure room state machine; worker/room.ts persists it and handles sockets

export interface Member {
  // The device's secret playerId, used to recognise it on reconnect; never sent to clients
  readonly id: string;
  // Public id that stands for this seat in views
  readonly seatId: string;
  readonly name: string;
  readonly lives: number;
}

export interface RoomState {
  readonly code: string;
  readonly hostId: string | null;
  // Seat order, which is join order
  readonly players: ReadonlyArray<Member>;
  readonly settings: GameSettings;
  readonly game: GameState;
}

export class RoomActionRejected extends Data.TaggedError("RoomActionRejected")<{
  readonly reason: string;
}> {}

const reject = (reason: string) =>
  Effect.fail(new RoomActionRejected({ reason }));

// Rooms start without a challenge, so everyone can join before the first turn
export const initialRoom = (code: string): RoomState => ({
  code,
  hostId: null,
  players: [],
  settings: DEFAULT_SETTINGS,
  game: emptyGame,
});

export const normalizeName = (name: string) =>
  name.trim().slice(0, MAX_NAME_LENGTH);

// Rejoining with a known id keeps the seat and its lives; new ids need a free name and a free seat.
// `seatId` is only used for a new seat.
export function join(
  state: RoomState,
  member: {
    readonly id: string;
    readonly name: string;
    readonly seatId: string;
  },
): RoomState | RoomActionRejected {
  const name = normalizeName(member.name);
  if (!name) return new RoomActionRejected({ reason: "Enter a name to join" });
  const taken = state.players.some(
    (p) => p.id !== member.id && p.name.toLowerCase() === name.toLowerCase(),
  );
  if (taken)
    return new RoomActionRejected({
      reason: `Someone called ${name} is already in this room`,
    });

  const existing = state.players.find((p) => p.id === member.id);
  if (existing) {
    return {
      ...state,
      players: state.players.map((p) =>
        p.id === member.id ? { ...p, name } : p,
      ),
    };
  }
  if (state.players.length >= MAX_ROOM_PLAYERS) {
    return new RoomActionRejected({ reason: "This room is full" });
  }
  return {
    ...state,
    hostId: state.hostId ?? member.id,
    players: [
      ...state.players,
      { id: member.id, seatId: member.seatId, name, lives: STARTING_LIVES },
    ],
  };
}

export function leave(
  state: RoomState,
  playerId: string,
  connectedIds: ReadonlySet<string>,
): RoomState {
  const players = state.players.filter((p) => p.id !== playerId);
  return ensureHost(
    {
      ...state,
      players,
      hostId: state.hostId === playerId ? null : state.hostId,
    },
    connectedIds,
  );
}

// Hands control to the longest-seated connected player once the host is gone
export function ensureHost(
  state: RoomState,
  connectedIds: ReadonlySet<string>,
): RoomState {
  if (state.hostId !== null && connectedIds.has(state.hostId)) return state;
  const next = state.players.find((p) => connectedIds.has(p.id));
  if (next) return { ...state, hostId: next.id };
  // Nobody connected: keep the old host so they get control back on return
  return state.hostId !== null &&
    state.players.some((p) => p.id === state.hostId)
    ? state
    : { ...state, hostId: state.players[0]?.id ?? null };
}

export const apply = Effect.fn("room.apply")(function* (
  state: RoomState,
  playerId: string,
  message: ClientMessage,
) {
  const current = state.game.challenges.at(-1)?.slug ?? null;

  switch (message._tag) {
    case "Leave":
      // Handled by the socket layer, which knows who is still connected
      return state;

    case "UpdateSettings": {
      if (state.hostId !== playerId)
        return yield* reject("Only the host can change settings");
      const settings = { ...state.settings, ...message.patch };
      return {
        ...state,
        settings,
        game: updateSettings(state.game, state.settings, settings),
      };
    }

    case "NextTurn": {
      // Someone else already moved the game on
      if (message.after !== current) return state;
      return { ...state, game: yield* nextTurn(state.game, state.settings) };
    }

    case "AddModifier": {
      if (message.slug !== current) return state;
      return { ...state, game: yield* addModifier(state.game, state.settings) };
    }

    case "SetLives": {
      if (!state.players.some((p) => p.seatId === message.playerId))
        return yield* reject("That player has left");
      return {
        ...state,
        players: state.players.map((p) =>
          p.seatId === message.playerId ? { ...p, lives: message.lives } : p,
        ),
      };
    }
  }
});

const seatOf = (state: RoomState, playerId: string | null) =>
  state.players.find((p) => p.id === playerId)?.seatId ?? null;

export function viewFor(
  state: RoomState,
  playerId: string,
  connectedIds: ReadonlySet<string>,
): RoomView {
  return {
    code: state.code,
    youId: seatOf(state, playerId) ?? "",
    hostId: seatOf(state, state.hostId),
    players: state.players.map((p) => ({
      id: p.seatId,
      name: p.name,
      lives: p.lives,
      connected: connectedIds.has(p.id),
    })),
    settings: state.settings,
    challenges: state.game.challenges.slice(-VIEW_CHALLENGES),
    hasHistory: hasHistory(state.game.deck),
  };
}
