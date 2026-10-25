import { Data, Schema } from "effect";
import { Atom } from "effect/reactivity";
import { PartySocket } from "partysocket";
import { persisted } from "./store";
import { LS_PLAYER_ID, LS_PLAYER_NAME } from "./constants";
import {
  ClientMessageJson,
  CreateRoomResponse,
  RoomCode,
  ServerMessageJson,
  type ClientMessage,
  type RoomView,
} from "./room-protocol";

// Identifies this device to rooms, so a reload or reconnect keeps the same seat.
// Written up front: a default that only lives in memory would change on every reload.
try {
  if (!localStorage.getItem(LS_PLAYER_ID))
    localStorage.setItem(LS_PLAYER_ID, JSON.stringify(crypto.randomUUID()));
} catch {
  // Storage unavailable (private mode): the id lasts for this page load
}
export const playerIdAtom = persisted(
  LS_PLAYER_ID,
  Schema.String,
  crypto.randomUUID(),
);
export const playerNameAtom = persisted(LS_PLAYER_NAME, Schema.String, "");

// ── Current room, mirrored in the URL as /room/ABCD ──

const isRoomCode = Schema.is(RoomCode);

export const normalizeRoomCode = (input: string) => input.trim().toUpperCase();

const codeFromPath = () => {
  const match = /^\/room\/([^/]+)\/?$/.exec(window.location.pathname);
  const code = match ? normalizeRoomCode(match[1]) : null;
  return code && isRoomCode(code) ? code : null;
};

export const roomCodeAtom = Atom.writable<string | null, string | null>(
  (get) => {
    const onPopState = () => get.setSelf(codeFromPath());
    window.addEventListener("popstate", onPopState);
    get.addFinalizer(() => window.removeEventListener("popstate", onPopState));
    return codeFromPath();
  },
  (ctx, code) => {
    window.history.pushState(null, "", code ? `/room/${code}` : "/");
    ctx.setSelf(code);
  },
).pipe(Atom.keepAlive);

export class RoomCreationLimited extends Data.TaggedError(
  "RoomCreationLimited",
)<{ readonly message: string }> {}

export const createRoom = async (): Promise<string> => {
  const response = await fetch("/api/rooms", { method: "POST" });
  if (response.status === 429)
    throw new RoomCreationLimited({ message: await response.text() });
  if (!response.ok) throw new Error(await response.text());
  return Schema.decodeUnknownSync(CreateRoomResponse)(await response.json())
    .code;
};

// ── Live connection ──

export interface RoomSession {
  // "connecting" also covers reconnecting after a drop, while `view` keeps the last known state
  readonly status: "connecting" | "open" | "ended";
  readonly view: RoomView | null;
  // Why the room turned us away or closed; set once status is "ended"
  readonly endedReason: string | null;
  // Latest refused action, e.g. a non-host changing settings; `at` distinguishes repeats
  readonly notice: { readonly reason: string; readonly at: number } | null;
  readonly send: (message: ClientMessage) => void;
}

const decodeServerMessage = Schema.decodeUnknownOption(ServerMessageJson);
const encodeClientMessage = Schema.encodeSync(ClientMessageJson);

// One socket per room while a component is subscribed; unmounting closes it
export const roomSessionAtom = Atom.family((code: string) =>
  Atom.make((get): RoomSession => {
    const socket = new PartySocket({
      host: window.location.host,
      party: "room",
      room: code,
      query: {
        playerId: get.once(playerIdAtom),
        name: get.once(playerNameAtom),
      },
    });
    const send = (message: ClientMessage) =>
      socket.send(encodeClientMessage(message));
    let session: RoomSession = {
      status: "connecting",
      view: null,
      endedReason: null,
      notice: null,
      send,
    };
    const update = (next: Partial<RoomSession>) =>
      get.setSelf((session = { ...session, ...next }));

    socket.addEventListener("message", (event) => {
      const message = decodeServerMessage(event.data);
      if (message._tag === "None") return;
      const m = message.value;
      if (m._tag === "State") update({ status: "open", view: m.view });
      else if (m._tag === "Rejected")
        update({ notice: { reason: m.reason, at: Date.now() } });
      else {
        socket.close();
        update({ status: "ended", endedReason: m.reason });
      }
    });
    // partysocket reconnects on its own; until then the last view stays up
    socket.addEventListener("close", () => {
      if (session.status === "open") update({ status: "connecting" });
    });
    get.addFinalizer(() => socket.close());
    return session;
  }),
);
