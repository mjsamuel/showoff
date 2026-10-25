import { Schema } from "effect";

export const ModifierProbability = Schema.Int.check(
  Schema.isBetween({ minimum: 0, maximum: 100 }),
);

export const GameSettings = Schema.Struct({
  repeat: Schema.Boolean,
  modifiers: Schema.Boolean,
  // 0 means modifiers are only added when a player asks for one
  modifierProbability: ModifierProbability,
});
export type GameSettings = typeof GameSettings.Type;

export const DEFAULT_SETTINGS: GameSettings = {
  repeat: false,
  modifiers: true,
  modifierProbability: 25,
};

export const Prompt = Schema.Struct({
  key: Schema.String,
  name: Schema.String,
  // Trusted HTML from data.json
  description: Schema.optionalKey(Schema.String),
  // Modifier keys that can't be paired with this category
  excluded: Schema.optionalKey(Schema.Array(Schema.String)),
});
export type Prompt = typeof Prompt.Type;

export const Challenge = Schema.Struct({
  // Unique for the session, so it doubles as a React key
  slug: Schema.String,
  category: Prompt,
  modifier: Schema.optionalKey(Prompt),
});
export type Challenge = typeof Challenge.Type;

// What each turn has drawn so far, so prompts don't repeat until all have been played
export interface Deck {
  readonly turn: number;
  readonly playedCategories: ReadonlyArray<string>;
  readonly playedModifiers: ReadonlyArray<string>;
}

export interface GameState {
  readonly deck: Deck;
  // Oldest first, capped at MAX_CHALLENGES
  readonly challenges: ReadonlyArray<Challenge>;
}

export const MAX_LIVES = 50;
export const STARTING_LIVES = 3;
export const Lives = Schema.Int.check(
  Schema.isBetween({ minimum: 0, maximum: MAX_LIVES }),
);

export interface Player {
  readonly id: string;
  readonly name: string;
  readonly lives: number;
}
