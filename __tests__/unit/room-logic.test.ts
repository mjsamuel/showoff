import { describe, expect, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
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
  ClientMessage,
  MAX_ROOM_PLAYERS,
  ServerMessageJson,
  VIEW_CHALLENGES,
} from "@/lib/room-protocol";

const joinOrThrow = (state: RoomState, id: string, name = id) => {
  const next = join(state, { id, name, seatId: `seat-${id}` });
  if (next instanceof RoomActionRejected) throw new Error(next.reason);
  return next;
};

const roomWith = (...ids: string[]) =>
  ids.reduce((s, id) => joinOrThrow(s, id), initialRoom("BCDF"));

const everyone = (state: RoomState) => new Set(state.players.map((p) => p.id));

const send = (state: RoomState, playerId: string, message: ClientMessage) =>
  Effect.runSync(apply(state, playerId, message));

const rejection = (
  state: RoomState,
  playerId: string,
  message: ClientMessage,
) => Effect.runSync(Effect.flip(apply(state, playerId, message))).reason;

const current = (state: RoomState) =>
  state.game.challenges.at(-1)?.slug ?? null;

const nextTurn = (state: RoomState, playerId = "a") =>
  send(state, playerId, { _tag: "NextTurn", after: current(state) });

describe("join", () => {
  it("makes the first player host, on three lives", () => {
    const state = roomWith("a", "b");
    expect(state.hostId).toBe("a");
    expect(state.players.map((p) => [p.id, p.lives])).toEqual([
      ["a", 3],
      ["b", 3],
    ]);
  });

  it("keeps the seat and lives when the same id rejoins", () => {
    let state = roomWith("a", "b");
    state = send(state, "a", {
      _tag: "ChangeLives",
      playerId: "seat-b",
      delta: -2,
    });
    state = joinOrThrow(state, "b", "Bobby");
    expect(state.players[1]).toEqual({
      id: "b",
      seatId: "seat-b",
      name: "Bobby",
      lives: 1,
    });
  });

  it("rejects a name another player already has, ignoring case", () => {
    expect(
      join(roomWith("Alice"), { id: "x", name: " alice ", seatId: "seat-x" }),
    ).toBeInstanceOf(RoomActionRejected);
  });

  it("rejects a blank name", () => {
    expect(
      join(initialRoom("BCDF"), { id: "x", name: "   ", seatId: "seat-x" }),
    ).toBeInstanceOf(RoomActionRejected);
  });

  it("rejects new players once the room is full", () => {
    const full = roomWith(
      ...Array.from({ length: MAX_ROOM_PLAYERS }, (_, i) => `p${i}`),
    );
    expect(
      join(full, { id: "late", name: "late", seatId: "seat-late" }),
    ).toBeInstanceOf(RoomActionRejected);
    // Someone already seated can still come back
    expect(
      join(full, { id: "p0", name: "p0", seatId: "seat-p0" }),
    ).not.toBeInstanceOf(RoomActionRejected);
  });
});

describe("host handover", () => {
  it("passes to the longest-seated connected player", () => {
    const state = ensureHost(roomWith("a", "b", "c"), new Set(["c", "b"]));
    expect(state.hostId).toBe("b");
  });

  it("keeps the old host while nobody is connected", () => {
    expect(ensureHost(roomWith("a", "b"), new Set()).hostId).toBe("a");
  });

  it("hands over when the host leaves", () => {
    const state = leave(roomWith("a", "b"), "a", new Set(["b"]));
    expect(state.hostId).toBe("b");
    expect(state.players.map((p) => p.id)).toEqual(["b"]);
  });
});

describe("apply", () => {
  it("starts without a challenge", () => {
    expect(roomWith("a").game.challenges).toEqual([]);
  });

  it("lets anyone take a turn", () => {
    const state = nextTurn(nextTurn(roomWith("a", "b")), "b");
    expect(state.game.challenges).toHaveLength(2);
  });

  it("draws one turn when two players tap at once", () => {
    const state = nextTurn(roomWith("a", "b"));
    const seen = current(state);
    const first = send(state, "a", { _tag: "NextTurn", after: seen });
    const second = send(first, "b", { _tag: "NextTurn", after: seen });
    expect(second).toBe(first);
    expect(second.game.challenges).toHaveLength(2);
  });

  it("only adds a modifier to the challenge the sender saw", () => {
    let state = send(roomWith("a"), "a", {
      _tag: "UpdateSettings",
      patch: { modifierProbability: 0 },
    });
    state = nextTurn(state);
    const stale = current(state)!;
    state = nextTurn(state);
    expect(send(state, "a", { _tag: "AddModifier", slug: stale })).toBe(state);
    expect(
      send(state, "a", {
        _tag: "AddModifier",
        slug: current(state)!,
      }).game.challenges.at(-1)?.modifier,
    ).toBeDefined();
  });

  it("only lets the host change settings", () => {
    const state = roomWith("a", "b");
    expect(
      rejection(state, "b", {
        _tag: "UpdateSettings",
        patch: { repeat: true },
      }),
    ).toMatch(/host/);
    const next = send(state, "a", {
      _tag: "UpdateSettings",
      patch: { repeat: true },
    });
    expect(next.settings).toEqual({ ...state.settings, repeat: true });
  });

  it("clears the play history when the host turns repeats on", () => {
    const state = send(nextTurn(roomWith("a")), "a", {
      _tag: "UpdateSettings",
      patch: { repeat: true },
    });
    expect(state.game.deck.playedCategories).toEqual([]);
  });

  it("lets anyone keep score", () => {
    const state = send(roomWith("a", "b"), "b", {
      _tag: "ChangeLives",
      playerId: "seat-a",
      delta: -1,
    });
    expect(state.players[0].lives).toBe(2);
  });

  // Two quick taps from the same total both count
  it("applies each change to the latest lives", () => {
    const tap = { _tag: "ChangeLives", playerId: "seat-a", delta: 1 } as const;
    const state = send(send(roomWith("a", "b"), "a", tap), "b", tap);
    expect(state.players[0].lives).toBe(5);
  });

  it("keeps lives between 0 and the maximum", () => {
    const state = send(roomWith("a"), "a", {
      _tag: "ChangeLives",
      playerId: "seat-a",
      delta: -10,
    });
    expect(state.players[0].lives).toBe(0);
  });

  it("rejects score changes for players who have left", () => {
    expect(
      rejection(roomWith("a"), "a", {
        _tag: "ChangeLives",
        playerId: "seat-gone",
        delta: 1,
      }),
    ).toMatch(/left/);
  });

  it("rejects fractional or oversized changes when decoding", () => {
    const decode = Schema.decodeUnknownOption(ClientMessage);
    expect(
      decode({ _tag: "ChangeLives", playerId: "seat-a", delta: 1.5 })._tag,
    ).toBe("None");
    expect(
      decode({ _tag: "ChangeLives", playerId: "seat-a", delta: 1000 })._tag,
    ).toBe("None");
  });

  it("ignores a modifier request once the host turns them off", () => {
    let state = send(roomWith("a", "b"), "a", {
      _tag: "UpdateSettings",
      patch: { modifierProbability: 0 },
    });
    state = nextTurn(state);
    const slug = current(state)!;
    state = send(state, "a", {
      _tag: "UpdateSettings",
      patch: { modifiers: false },
    });
    expect(send(state, "b", { _tag: "AddModifier", slug })).toBe(state);
  });
});

describe("viewFor", () => {
  it("only shows public seat ids", () => {
    const state = joinOrThrow(
      joinOrThrow(initialRoom("BCDF"), "secret-a", "Ann"),
      "secret-b",
      "Bob",
    );
    const view = viewFor(state, "secret-b", everyone(state));
    expect(view.youId).toBe("seat-secret-b");
    expect(view.hostId).toBe("seat-secret-a");
    expect(JSON.stringify(view)).not.toMatch(/"secret-/);
  });

  it("marks who is connected", () => {
    const state = roomWith("a", "b");
    expect(
      viewFor(state, "a", new Set(["a"])).players.map((p) => p.connected),
    ).toEqual([true, false]);
  });

  it("only sends the latest challenges", () => {
    let state = roomWith("a");
    for (let i = 0; i < VIEW_CHALLENGES + 3; i++) state = nextTurn(state);
    const view = viewFor(state, "a", everyone(state));
    expect(view.challenges).toEqual(
      state.game.challenges.slice(-VIEW_CHALLENGES),
    );
    expect(view.hasHistory).toBe(true);
  });

  it("encodes as a valid server message", () => {
    const state = nextTurn(roomWith("a"));
    const view = viewFor(state, "a", everyone(state));
    const json = Schema.encodeSync(ServerMessageJson)({ _tag: "State", view });
    expect(Schema.decodeSync(ServerMessageJson)(json)).toEqual({
      _tag: "State",
      view,
    });
  });
});
