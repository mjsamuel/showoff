import { Schema } from "effect";
import { Challenge, GameSettings, Lives } from "./types";

// Shared by the browser and the Room Durable Object (worker/room.ts)

// Consonants only: no vowels means no accidental words, and no O/0 or I/1 mix-ups
export const ROOM_CODE_ALPHABET = "BCDFGHJKLMNPQRSTVWXZ";
export const ROOM_CODE_LENGTH = 4;
export const RoomCode = Schema.String.check(
  Schema.isPattern(/^[BCDFGHJKLMNPQRSTVWXZ]{4}$/),
);

export const MAX_ROOM_PLAYERS = 20;
export const MAX_NAME_LENGTH = 20;
// The board shows at most this many challenges, so views only carry these
export const VIEW_CHALLENGES = 5;

// Close codes (4000+) end the session for good, always preceded by an Ended message
export const CLOSE_LEFT = 4000;
export const CLOSE_REJECTED = 4403;
export const CLOSE_ROOM_NOT_FOUND = 4404;

// Only the fields being changed, so quick edits to different settings can't undo each other
export const RoomSettingsPatch = Schema.Struct({
  repeat: Schema.optionalKey(GameSettings.fields.repeat),
  modifiers: Schema.optionalKey(GameSettings.fields.modifiers),
  modifierProbability: Schema.optionalKey(
    GameSettings.fields.modifierProbability,
  ),
});
export type RoomSettingsPatch = typeof RoomSettingsPatch.Type;

// ── Client → room ──
// Settings are host-only; anyone can take a turn or keep score

export const ClientMessage = Schema.TaggedUnion({
  UpdateSettings: { patch: RoomSettingsPatch },
  // `after` is the challenge the sender was looking at, so two players tapping
  // at once draw one turn rather than skipping one
  NextTurn: { after: Schema.NullOr(Schema.String) },
  // Only applies while `slug` is still the current challenge
  AddModifier: { slug: Schema.String },
  // A public seat id
  SetLives: { playerId: Schema.String, lives: Lives },
  Leave: {},
});
export type ClientMessage = typeof ClientMessage.Type;
export const ClientMessageJson = Schema.fromJsonString(ClientMessage);

// ── Room → client ──
// Player ids in views are public seat ids; the device's own playerId is a secret that
// proves who you are on reconnect, so it never appears in anything sent to others.

export const RoomPlayer = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  lives: Schema.Number,
  connected: Schema.Boolean,
});
export type RoomPlayer = typeof RoomPlayer.Type;

export const RoomView = Schema.Struct({
  code: Schema.String,
  youId: Schema.String,
  hostId: Schema.NullOr(Schema.String),
  players: Schema.Array(RoomPlayer),
  settings: GameSettings,
  // The latest few, oldest first
  challenges: Schema.Array(Challenge),
  // Whether turning repeats on would clear the play history
  hasHistory: Schema.Boolean,
});
export type RoomView = typeof RoomView.Type;

export const ServerMessage = Schema.TaggedUnion({
  State: { view: RoomView },
  // An action was refused; the session carries on
  Rejected: { reason: Schema.String },
  // The session is over (room missing, name taken, left): don't reconnect
  Ended: { reason: Schema.String },
});
export type ServerMessage = typeof ServerMessage.Type;
export const ServerMessageJson = Schema.fromJsonString(ServerMessage);

export const CreateRoomResponse = Schema.Struct({ code: RoomCode });
