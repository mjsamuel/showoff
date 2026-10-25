import { Effect, Schema } from "effect";
import {
  Server,
  type Connection,
  type ConnectionContext,
  type WSMessage,
} from "partyserver";
import {
  apply,
  ensureHost,
  initialRoom,
  join,
  leave,
  RoomActionRejected,
  viewFor,
  type RoomState,
} from "@/lib/room-logic";
import {
  ClientMessageJson,
  CLOSE_LEFT,
  CLOSE_REJECTED,
  CLOSE_ROOM_NOT_FOUND,
  ServerMessageJson,
  type ServerMessage,
} from "@/lib/room-protocol";
import type { WorkerEnv } from "../alchemy.run";

const STORAGE_KEY = "room";
// An empty room is forgotten (and its code freed) after an hour
const IDLE_TTL_MS = 60 * 60 * 1000;
// The playerId is a per-device secret (views only carry public seat ids)
const PLAYER_ID = /^[\w-]{8,64}$/;

// Abuse limits. Every accepted message is a storage write plus a broadcast to the room,
// so these keep one misbehaving client from running up usage.
// 20 seats plus spare tabs and reconnects still in flight
const MAX_CONNECTIONS = 40;
// Per player, so opening more sockets doesn't buy more messages. A reconnect can arrive
// before the dropped socket is noticed, so extra sockets close the oldest ones.
const MAX_CONNECTIONS_PER_PLAYER = 3;
// Real clients send a message per turn or tap on a life counter; anything near this is a script
const MAX_MESSAGES_PER_SECOND = 10;
const MAX_MESSAGE_BYTES = 4096;

interface Seat {
  readonly playerId: string;
  // Missing on sockets opened before this was recorded
  readonly connectedAt?: number;
}

// Room state is small plain data, so comparing its JSON is cheap and exact
const sameState = (a: RoomState, b: RoomState) =>
  a === b || JSON.stringify(a) === JSON.stringify(b);

const utf8 = new TextEncoder();
const decodeMessage = Schema.decodeUnknownOption(ClientMessageJson);
const encodeMessage = Schema.encodeSync(ServerMessageJson);

// One game room per 4-letter code. State lives in storage so it survives hibernation.
export class Room extends Server<WorkerEnv> {
  // Idle rooms sleep (and stop billing) while their websockets stay open
  static options = { hibernate: true };

  #state: RoomState | null = null;
  // Per-player message counts for the current one-second window. In memory only:
  // losing it to hibernation just resets the window.
  #messageWindows = new Map<string, { start: number; count: number }>();

  async onStart() {
    const stored = await this.ctx.storage.get<RoomState>(STORAGE_KEY);
    this.#state = stored ?? null;
  }

  // Called by POST /api/rooms; false means the code is already in use
  async claim(): Promise<boolean> {
    if (this.#state) return false;
    await this.#save(initialRoom(this.name));
    await this.ctx.storage.setAlarm(Date.now() + IDLE_TTL_MS);
    return true;
  }

  async onConnect(connection: Connection<Seat>, ctx: ConnectionContext) {
    if (!this.#state)
      return this.#end(connection, CLOSE_ROOM_NOT_FOUND, "Room not found");
    // The new connection is already counted
    if ([...this.getConnections()].length > MAX_CONNECTIONS) {
      return this.#end(
        connection,
        CLOSE_REJECTED,
        "This room is too busy right now",
      );
    }

    const params = new URL(ctx.request.url).searchParams;
    const playerId = params.get("playerId") ?? "";
    if (!PLAYER_ID.test(playerId))
      return this.#end(connection, CLOSE_REJECTED, "Invalid player");

    const joined = join(this.#state, {
      id: playerId,
      name: params.get("name") ?? "",
      seatId: crypto.randomUUID(),
    });
    if (joined instanceof RoomActionRejected)
      return this.#end(connection, CLOSE_REJECTED, joined.reason);

    connection.setState({ playerId, connectedAt: Date.now() });
    // The first player back after everyone dropped may need to take over as host
    await this.#commit(ensureHost(joined, this.#connectedIds()));

    const oldestFirst = this.#connectionsOf(playerId).sort(
      (a, b) => (a.state?.connectedAt ?? 0) - (b.state?.connectedAt ?? 0),
    );
    for (const c of oldestFirst.slice(0, -MAX_CONNECTIONS_PER_PLAYER)) {
      this.#end(c, CLOSE_REJECTED, "This room was opened in another tab");
    }
  }

  async onMessage(connection: Connection<Seat>, raw: WSMessage) {
    const playerId = connection.state?.playerId;
    if (!this.#state || !playerId) return;
    // Every frame counts toward the rate limit, binary ones included
    if (this.#overLimit(playerId)) {
      for (const c of this.#connectionsOf(playerId)) {
        this.#end(
          c,
          CLOSE_REJECTED,
          "Too many messages. Rejoin to keep playing.",
        );
      }
      return;
    }
    // The protocol is JSON text only. A UTF-16 string is at least 1 byte per code unit,
    // so the length check rejects most oversized messages before encoding.
    if (
      typeof raw !== "string" ||
      raw.length > MAX_MESSAGE_BYTES ||
      utf8.encode(raw).byteLength > MAX_MESSAGE_BYTES
    ) {
      return this.#end(connection, CLOSE_REJECTED, "Invalid message");
    }

    const message = decodeMessage(raw);
    if (message._tag === "None") return;

    if (message.value._tag === "Leave") {
      // Close every tab this player has open, then drop their seat
      for (const c of this.#connectionsOf(playerId))
        this.#end(c, CLOSE_LEFT, "Left the room");
      await this.#commit(
        leave(this.#state, playerId, this.#connectedIds(playerId)),
      );
      return;
    }

    const result = await Effect.runPromise(
      Effect.result(apply(this.#state, playerId, message.value)),
    );
    if (result._tag === "Failure") {
      this.#send(connection, {
        _tag: "Rejected",
        reason: result.failure.reason,
      });
      return;
    }
    // Repeats like a second "Next turn" for the same challenge change nothing, so skip the write and broadcast
    if (!sameState(result.success, this.#state))
      await this.#commit(result.success);
  }

  async onClose(connection: Connection<Seat>) {
    const playerId = connection.state?.playerId;
    if (!this.#state || !playerId) return;
    const connected = this.#connectedIds(undefined, connection);
    await this.#commit(ensureHost(this.#state, connected), connected);
    if (connected.size === 0)
      await this.ctx.storage.setAlarm(Date.now() + IDLE_TTL_MS);
  }

  async onAlarm() {
    if (this.#connectedIds().size > 0) return;
    await this.ctx.storage.deleteAll();
    this.#state = null;
  }

  async #commit(state: RoomState, connected = this.#connectedIds()) {
    await this.#save(state);
    for (const c of this.getConnections<Seat>()) {
      const playerId = c.state?.playerId;
      if (playerId)
        this.#send(c, {
          _tag: "State",
          view: viewFor(state, playerId, connected),
        });
    }
  }

  async #save(state: RoomState) {
    this.#state = state;
    await this.ctx.storage.put(STORAGE_KEY, state);
  }

  // A close sent during onConnect can be lost before the socket reaches the client,
  // so the Ended message is what the client relies on
  #end(connection: Connection, code: number, reason: string) {
    this.#send(connection, { _tag: "Ended", reason });
    connection.close(code, reason);
  }

  #overLimit(playerId: string) {
    const now = Date.now();
    const window = this.#messageWindows.get(playerId);
    if (!window || now - window.start >= 1000) {
      // Expired windows go here rather than on disconnect, so reconnecting doesn't reset a budget
      for (const [id, w] of this.#messageWindows)
        if (now - w.start >= 1000) this.#messageWindows.delete(id);
      this.#messageWindows.set(playerId, { start: now, count: 1 });
      return false;
    }
    window.count++;
    return window.count > MAX_MESSAGES_PER_SECOND;
  }

  #send(connection: Connection, message: ServerMessage) {
    connection.send(encodeMessage(message));
  }

  #connectionsOf(playerId: string) {
    return [...this.getConnections<Seat>()].filter(
      (c) => c.state?.playerId === playerId,
    );
  }

  // Players with at least one open socket, optionally ignoring one player or one closing socket.
  // The socket is compared by identity: PartySocket reconnects with the same connection id,
  // so matching on id would also skip a reconnected player's live replacement.
  #connectedIds(exceptPlayer?: string, exceptConnection?: Connection) {
    const ids = new Set<string>();
    for (const c of this.getConnections<Seat>()) {
      const playerId = c.state?.playerId;
      if (playerId && playerId !== exceptPlayer && c !== exceptConnection)
        ids.add(playerId);
    }
    return ids;
  }
}
