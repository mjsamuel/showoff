// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "@effect/vitest";
import { AtomRegistry } from "effect/reactivity";
import {
  addModifierAtom,
  addPlayerAtom,
  gameAtom,
  nextTurnAtom,
  playersAtom,
  removePlayerAtom,
  renamePlayerAtom,
  changeLivesAtom,
  settingsAtom,
  updateSettingsAtom,
} from "@/lib/store";
import { LS_SETTINGS } from "@/lib/constants";
import { DEFAULT_SETTINGS, MAX_LIVES } from "@/lib/types";

let registry: AtomRegistry.AtomRegistry;

beforeEach(() => {
  localStorage.clear();
  registry = AtomRegistry.make();
});

afterEach(() => registry.dispose());

describe("persisted settings", () => {
  it("uses defaults when storage is empty", () => {
    expect(registry.get(settingsAtom)).toEqual(DEFAULT_SETTINGS);
  });

  // Written by the Next.js version as JSON.stringify(settings)
  it("reads settings saved by earlier versions", () => {
    localStorage.setItem(
      LS_SETTINGS,
      JSON.stringify({
        repeat: true,
        modifiers: false,
        modifierProbability: 75,
      }),
    );
    expect(registry.get(settingsAtom)).toEqual({
      repeat: true,
      modifiers: false,
      modifierProbability: 75,
    });
  });

  it.each([
    ["not json"],
    [JSON.stringify({ repeat: "yes" })],
    [JSON.stringify({ ...DEFAULT_SETTINGS, modifierProbability: 101 })],
  ])("falls back to defaults for %s", (stored) => {
    localStorage.setItem(LS_SETTINGS, stored);
    expect(registry.get(settingsAtom)).toEqual(DEFAULT_SETTINGS);
  });

  it("saves changes", () => {
    registry.set(updateSettingsAtom, { modifierProbability: 50 });
    expect(JSON.parse(localStorage.getItem(LS_SETTINGS)!)).toEqual({
      ...DEFAULT_SETTINGS,
      modifierProbability: 50,
    });
  });
});

describe("game", () => {
  it("starts with the first turn drawn", () => {
    expect(registry.get(gameAtom).challenges).toHaveLength(1);
  });

  it("draws a challenge each turn", () => {
    registry.set(nextTurnAtom, undefined);
    registry.set(nextTurnAtom, undefined);
    expect(registry.get(gameAtom).challenges).toHaveLength(3);
  });

  it("adds a modifier on request", () => {
    registry.set(updateSettingsAtom, { modifierProbability: 0 });
    registry.set(nextTurnAtom, undefined);
    expect(registry.get(gameAtom).challenges.at(-1)?.modifier).toBeUndefined();
    registry.set(addModifierAtom, undefined);
    expect(registry.get(gameAtom).challenges.at(-1)?.modifier).toBeDefined();
  });

  it("clears the play history when repeats are turned on", () => {
    registry.set(nextTurnAtom, undefined);
    registry.set(updateSettingsAtom, { repeat: true });
    expect(registry.get(gameAtom).deck.playedCategories).toEqual([]);
    expect(registry.get(settingsAtom).repeat).toBe(true);
  });
});

describe("players", () => {
  it("starts with one player on three lives", () => {
    expect(registry.get(playersAtom)).toMatchObject([
      { name: "Player 1", lives: 3 },
    ]);
  });

  it("adds, renames and removes players by id", () => {
    registry.set(addPlayerAtom, undefined);
    registry.set(addPlayerAtom, undefined);
    const [first, second, third] = registry.get(playersAtom);
    registry.set(renamePlayerAtom, { id: third.id, name: "Cleo" });
    registry.set(removePlayerAtom, second.id);
    expect(registry.get(playersAtom).map((p) => [p.id, p.name])).toEqual([
      [first.id, "Player 1"],
      [third.id, "Cleo"],
    ]);
  });

  it("keeps lives between 0 and the maximum", () => {
    const [{ id }] = registry.get(playersAtom);
    registry.set(changeLivesAtom, { id, delta: -4 });
    expect(registry.get(playersAtom)[0].lives).toBe(0);
    registry.set(changeLivesAtom, { id, delta: MAX_LIVES + 1 });
    expect(registry.get(playersAtom)[0].lives).toBe(MAX_LIVES);
  });
});
