import { describe, expect, it } from "@effect/vitest";
import { Effect, Option, Random } from "effect";
import {
  addModifier,
  canAddModifier,
  CATEGORIES,
  drawPrompt,
  emptyGame,
  MAX_CHALLENGES,
  MODIFIERS,
  nextTurn,
  updateSettings,
} from "@/lib/game-logic";
import {
  DEFAULT_SETTINGS,
  type GameSettings,
  type GameState,
  type Prompt,
} from "@/lib/types";

const run = <A, E>(effect: Effect.Effect<A, E>) => Effect.runSync(effect);

// Every draw returns `value`, standing in for a mocked Math.random
const withDraw =
  (value: number) =>
  <A, E>(effect: Effect.Effect<A, E>) =>
    Effect.runSync(
      Effect.provideService(effect, Random.Random, {
        nextDoubleUnsafe: () => value,
        nextIntUnsafe: () => 0,
      }),
    );

const prompts = (...keys: string[]): Prompt[] =>
  keys.map((key) => ({ key, name: key }));

const settings = (overrides: Partial<GameSettings> = {}): GameSettings => ({
  ...DEFAULT_SETTINGS,
  ...overrides,
});

const turns = (
  count: number,
  s: GameSettings,
  state: GameState = emptyGame,
) => {
  for (let i = 0; i < count; i++) state = run(nextTurn(state, s));
  return state;
};

describe("prompt data", () => {
  it("joins multi-line descriptions", () => {
    const oneHanded = CATEGORIES.find((c) => c.key === "one-handed");
    expect(oneHanded?.description).toBe(
      "Moves performed using only one hand (can be either hand). No cuts allowed.",
    );
  });

  it("only excludes modifiers that exist", () => {
    const keys = new Set(MODIFIERS.map((m) => m.key));
    for (const c of CATEGORIES)
      for (const key of c.excluded ?? []) expect(keys).toContain(key);
  });
});

describe("drawPrompt", () => {
  it("never repeats a prompt until every one has been played", () => {
    const all = prompts("a", "b", "c");
    let played: ReadonlyArray<string> = [];
    const seen: string[] = [];
    for (let i = 0; i < 3; i++) {
      const drawn = Option.getOrThrow(run(drawPrompt(all, played, false)));
      seen.push(drawn.prompt.key);
      played = drawn.played;
    }
    expect(seen.sort()).toEqual(["a", "b", "c"]);
  });

  it("starts the cycle over once everything allowed has been played", () => {
    const drawn = Option.getOrThrow(
      run(drawPrompt(prompts("a", "b"), ["a", "b"], false)),
    );
    expect(drawn.played).toEqual([drawn.prompt.key]);
  });

  // The old engine looped forever here: everything allowed was played, but not everything
  it("restarts the cycle when only excluded prompts are unplayed", () => {
    const drawn = Option.getOrThrow(
      run(drawPrompt(prompts("a", "b", "c"), ["a", "b"], false, ["c"])),
    );
    expect(["a", "b"]).toContain(drawn.prompt.key);
    expect(drawn.played).toEqual([drawn.prompt.key]);
  });

  it("keeps the history of excluded prompts when restarting", () => {
    const drawn = Option.getOrThrow(
      run(drawPrompt(prompts("a", "b", "c"), ["c", "a", "b"], false, ["c"])),
    );
    expect(drawn.played).toEqual(["c", drawn.prompt.key]);
  });

  it("allows played prompts when repeats are on", () => {
    const drawn = Option.getOrThrow(
      withDraw(0)(drawPrompt(prompts("a", "b"), ["a"], true)),
    );
    expect(drawn.prompt.key).toBe("a");
    expect(drawn.played).toEqual(["a"]);
  });

  it("never draws an excluded prompt", () => {
    for (let i = 0; i < 20; i++) {
      const drawn = Option.getOrThrow(
        run(drawPrompt(prompts("a", "b"), [], true, ["a"])),
      );
      expect(drawn.prompt.key).toBe("b");
    }
  });

  it("draws nothing when everything is excluded", () => {
    expect(Option.isNone(run(drawPrompt(prompts("a"), [], false, ["a"])))).toBe(
      true,
    );
  });
});

describe("nextTurn", () => {
  it("adds a challenge with a unique slug each turn", () => {
    const state = turns(3, settings({ modifiers: false }));
    expect(state.challenges).toHaveLength(3);
    expect(new Set(state.challenges.map((c) => c.slug)).size).toBe(3);
    expect(state.deck.turn).toBe(3);
  });

  it("adds a modifier when the draw is under the probability", () => {
    const state = withDraw(0.1)(
      nextTurn(emptyGame, settings({ modifierProbability: 25 })),
    );
    expect(state.challenges[0].modifier).toBeDefined();
    expect(state.deck.playedModifiers).toHaveLength(1);
  });

  it("skips the modifier when the draw is over the probability", () => {
    const state = withDraw(0.5)(
      nextTurn(emptyGame, settings({ modifierProbability: 25 })),
    );
    expect(state.challenges[0].modifier).toBeUndefined();
  });

  it("never adds a modifier at 0%, or with modifiers off", () => {
    expect(
      withDraw(0)(nextTurn(emptyGame, settings({ modifierProbability: 0 })))
        .challenges[0].modifier,
    ).toBeUndefined();
    expect(
      withDraw(0)(nextTurn(emptyGame, settings({ modifiers: false })))
        .challenges[0].modifier,
    ).toBeUndefined();
  });

  it("never pairs a category with a modifier it excludes", () => {
    const state = turns(
      300,
      settings({ modifierProbability: 100, repeat: true }),
    );
    for (const { category, modifier } of state.challenges) {
      expect(category.excluded ?? []).not.toContain(modifier?.key);
    }
  });

  it("keeps only the latest challenges", () => {
    const state = turns(MAX_CHALLENGES + 5, settings({ modifiers: false }));
    expect(state.challenges).toHaveLength(MAX_CHALLENGES);
    expect(
      state.challenges.at(-1)?.slug.startsWith(`${MAX_CHALLENGES + 5}-`),
    ).toBe(true);
  });
});

describe("addModifier", () => {
  const onRequest = settings({ modifierProbability: 0 });

  it("adds a modifier to the current challenge only", () => {
    const before = turns(2, onRequest);
    const after = run(addModifier(before, onRequest));
    expect(after.challenges[0]).toEqual(before.challenges[0]);
    expect(after.challenges[1].modifier).toBeDefined();
    expect(after.challenges[1].slug).toBe(before.challenges[1].slug);
    expect(canAddModifier(after.challenges, onRequest)).toBe(false);
  });

  it("does nothing unless modifiers are on request", () => {
    const state = turns(1, onRequest);
    expect(run(addModifier(state, settings({ modifierProbability: 50 })))).toBe(
      state,
    );
    expect(
      run(
        addModifier(
          state,
          settings({ modifiers: false, modifierProbability: 0 }),
        ),
      ),
    ).toBe(state);
  });

  it("does nothing once the challenge has a modifier", () => {
    const once = run(addModifier(turns(1, onRequest), onRequest));
    expect(run(addModifier(once, onRequest))).toBe(once);
  });

  it("is only offered when modifiers are on request", () => {
    const state = turns(1, onRequest);
    expect(canAddModifier(state.challenges, onRequest)).toBe(true);
    expect(
      canAddModifier(state.challenges, settings({ modifierProbability: 50 })),
    ).toBe(false);
    expect(
      canAddModifier(
        state.challenges,
        settings({ modifierProbability: 0, modifiers: false }),
      ),
    ).toBe(false);
    expect(canAddModifier([], onRequest)).toBe(false);
  });
});

describe("updateSettings", () => {
  it("clears the play history when repeats are turned on, keeping the turn count", () => {
    const state = turns(2, settings());
    const next = updateSettings(
      state,
      settings({ repeat: false }),
      settings({ repeat: true }),
    );
    expect(next.deck).toEqual({
      turn: 2,
      playedCategories: [],
      playedModifiers: [],
    });
    expect(next.challenges).toBe(state.challenges);
  });

  it("keeps the history for any other change", () => {
    const state = turns(2, settings());
    expect(
      updateSettings(
        state,
        settings({ repeat: true }),
        settings({ repeat: false }),
      ),
    ).toBe(state);
    expect(
      updateSettings(state, settings(), settings({ modifierProbability: 50 })),
    ).toBe(state);
  });
});
