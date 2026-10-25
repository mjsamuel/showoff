import { Effect, Schema } from "effect";
import { KeyValueStore } from "effect/persistence";
import { Atom } from "effect/reactivity";
import { emptyGame, addModifier, nextTurn, updateSettings } from "./game-logic";
import { LS_SETTINGS } from "./constants";
import {
  DEFAULT_SETTINGS,
  GameSettings,
  STARTING_LIVES,
  clampLives,
  type GameState,
  type Player,
} from "./types";

// ── Persisted settings ──
// Values that fail to decode fall back to their defaults

const storage = Atom.runtime(KeyValueStore.layerStorage(() => localStorage));

export const persisted = <S extends Schema.ConstraintCodec<unknown, unknown>>(
  key: string,
  schema: S,
  defaultValue: S["Type"],
) =>
  Atom.kvs({
    runtime: storage,
    key,
    schema,
    defaultValue: () => defaultValue,
  }).pipe(Atom.keepAlive);

export const settingsAtom = persisted(
  LS_SETTINGS,
  GameSettings,
  DEFAULT_SETTINGS,
);

// ── Session state ──

// The first turn is drawn as soon as the game is first read
export const gameAtom = Atom.writable<GameState, GameState>(
  (get) => Effect.runSync(nextTurn(emptyGame, get.once(settingsAtom))),
  (ctx, state) => ctx.setSelf(state),
).pipe(Atom.keepAlive);

const newPlayer = (name: string): Player => ({
  id: crypto.randomUUID(),
  name,
  lives: STARTING_LIVES,
});

export const playersAtom = Atom.make<ReadonlyArray<Player>>([
  newPlayer("Player 1"),
]).pipe(Atom.keepAlive);

// ── Actions ──
// Write-only atoms, so reads inside a command never become subscriptions

const command = <Arg = void>(
  run: (ctx: Atom.WriteContext<void>, arg: Arg) => void,
) => Atom.writable<void, Arg>(() => undefined, run);

export const nextTurnAtom = command((ctx) => {
  ctx.set(
    gameAtom,
    Effect.runSync(nextTurn(ctx.get(gameAtom), ctx.get(settingsAtom))),
  );
});

export const addModifierAtom = command((ctx) => {
  ctx.set(
    gameAtom,
    Effect.runSync(addModifier(ctx.get(gameAtom), ctx.get(settingsAtom))),
  );
});

export const updateSettingsAtom = command<Partial<GameSettings>>(
  (ctx, patch) => {
    const previous = ctx.get(settingsAtom);
    const next = { ...previous, ...patch };
    ctx.set(gameAtom, updateSettings(ctx.get(gameAtom), previous, next));
    ctx.set(settingsAtom, next);
  },
);

export const addPlayerAtom = command((ctx) => {
  const players = ctx.get(playersAtom);
  ctx.set(playersAtom, [...players, newPlayer(`Player ${players.length + 1}`)]);
});

export const removePlayerAtom = command<string>((ctx, id) => {
  ctx.set(
    playersAtom,
    ctx.get(playersAtom).filter((p) => p.id !== id),
  );
});

const updatePlayer = (
  players: ReadonlyArray<Player>,
  id: string,
  change: Partial<Player>,
) => players.map((p) => (p.id === id ? { ...p, ...change } : p));

export const renamePlayerAtom = command<{ id: string; name: string }>(
  (ctx, { id, name }) => {
    ctx.set(playersAtom, updatePlayer(ctx.get(playersAtom), id, { name }));
  },
);

export const changeLivesAtom = command<{ id: string; delta: number }>(
  (ctx, { id, delta }) => {
    ctx.set(
      playersAtom,
      ctx
        .get(playersAtom)
        .map((p) =>
          p.id === id ? { ...p, lives: clampLives(p.lives + delta) } : p,
        ),
    );
  },
);
