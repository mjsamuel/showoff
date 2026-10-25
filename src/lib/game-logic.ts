import { Effect, Option, Random } from "effect";
import rawData from "./data.json";
import type { Challenge, Deck, GameSettings, GameState, Prompt } from "./types";

// Most recent challenges kept around; the board only shows the last few
export const MAX_CHALLENGES = 50;

type RawPrompts = Record<
  string,
  { name: string; description?: string | string[]; excluded?: string[] }
>;

// data.json splits long descriptions into an array of lines
const toPrompts = (raw: RawPrompts): ReadonlyArray<Prompt> =>
  Object.entries(raw).map(([key, { name, description, excluded }]) => ({
    key,
    name,
    ...(description !== undefined && {
      description: Array.isArray(description)
        ? description.join("")
        : description,
    }),
    ...(excluded !== undefined && { excluded }),
  }));

export const CATEGORIES = toPrompts(rawData.categories);
export const MODIFIERS = toPrompts(rawData.modifiers);

export const emptyDeck: Deck = {
  turn: 0,
  playedCategories: [],
  playedModifiers: [],
};

export const emptyGame: GameState = { deck: emptyDeck, challenges: [] };

const pick = <A>(items: ReadonlyArray<A>) =>
  Effect.map(
    Random.nextIntBetween(0, items.length, { halfOpen: true }),
    (i) => items[i],
  );

// Draws a prompt that isn't excluded and, unless repeats are on, hasn't been played.
// Once every allowed prompt has been played their history is cleared and the cycle restarts.
export const drawPrompt = Effect.fn("drawPrompt")(function* (
  prompts: ReadonlyArray<Prompt>,
  played: ReadonlyArray<string>,
  repeat: boolean,
  excluded: ReadonlyArray<string> = [],
) {
  const allowed = prompts.filter((p) => !excluded.includes(p.key));
  if (allowed.length === 0)
    return Option.none<{ prompt: Prompt; played: ReadonlyArray<string> }>();

  const fresh = allowed.filter((p) => !played.includes(p.key));
  const exhausted = fresh.length === 0;
  const prompt = yield* pick(repeat || exhausted ? allowed : fresh);
  const history = exhausted
    ? played.filter((key) => !allowed.some((p) => p.key === key))
    : played.filter((key) => key !== prompt.key);
  return Option.some({ prompt, played: [...history, prompt.key] });
});

const drawModifier = (deck: Deck, settings: GameSettings, category: Prompt) =>
  drawPrompt(
    MODIFIERS,
    deck.playedModifiers,
    settings.repeat,
    category.excluded,
  );

const addChallenge = (
  state: GameState,
  deck: Deck,
  challenge: Challenge,
): GameState => ({
  deck,
  challenges: [...state.challenges, challenge].slice(-MAX_CHALLENGES),
});

export const nextTurn = Effect.fn("nextTurn")(function* (
  state: GameState,
  settings: GameSettings,
) {
  const turn = state.deck.turn + 1;
  // Categories exclude nothing, so there's always one to draw
  const category = Option.getOrThrow(
    yield* drawPrompt(CATEGORIES, state.deck.playedCategories, settings.repeat),
  );
  const deck = { ...state.deck, turn, playedCategories: category.played };

  const wantsModifier =
    settings.modifiers &&
    (yield* Random.next) < settings.modifierProbability / 100;
  const modifier = wantsModifier
    ? yield* drawModifier(deck, settings, category.prompt)
    : Option.none();

  if (Option.isNone(modifier)) {
    return addChallenge(state, deck, {
      slug: `${turn}-${category.prompt.key}`,
      category: category.prompt,
    });
  }
  return addChallenge(
    state,
    { ...deck, playedModifiers: modifier.value.played },
    {
      slug: `${turn}-${category.prompt.key}-${modifier.value.prompt.key}`,
      category: category.prompt,
      modifier: modifier.value.prompt,
    },
  );
});

// A player asking for a modifier on the current challenge, when it doesn't have one yet
export const addModifier = Effect.fn("addModifier")(function* (
  state: GameState,
  settings: GameSettings,
) {
  const current = state.challenges.at(-1);
  if (!current || current.modifier) return state;
  const modifier = yield* drawModifier(state.deck, settings, current.category);
  if (Option.isNone(modifier)) return state;
  return {
    deck: { ...state.deck, playedModifiers: modifier.value.played },
    challenges: [
      ...state.challenges.slice(0, -1),
      { ...current, modifier: modifier.value.prompt },
    ],
  };
});

// With the probability at 0, modifiers are only added on request
export const canAddModifier = (
  challenges: ReadonlyArray<Challenge>,
  settings: GameSettings,
) => {
  const current = challenges.at(-1);
  return (
    settings.modifiers &&
    settings.modifierProbability === 0 &&
    !!current &&
    !current.modifier
  );
};

export const hasHistory = (deck: Deck) =>
  deck.playedCategories.length > 0 || deck.playedModifiers.length > 0;

// Turning repeats on starts the play history afresh. The turn count carries on so slugs stay unique.
export function updateSettings(
  state: GameState,
  previous: GameSettings,
  next: GameSettings,
): GameState {
  if (previous.repeat || !next.repeat) return state;
  return {
    ...state,
    deck: { ...state.deck, playedCategories: [], playedModifiers: [] },
  };
}
