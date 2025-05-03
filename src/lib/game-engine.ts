import rawData from "./data.json";
import { getRandomNumberInRange } from "./utils";

export type GameSettings = {
  repeat: boolean;
  modifiers: boolean;
  modifierProbability: number;
};

type PromptKey = string;
export type Prompt = {
  key: PromptKey;
  name: string;
  description?: string;
  excluded?: string[];
};
type Collection = {
  prompts: Prompt[];
  played: Set<PromptKey>;
};
export type Challenge = {
  slug: string;
  category: Prompt;
  modifier?: Prompt;
};

type SystemMessage = "history.cleared";

export class GameEngine {
  settings: GameSettings;
  categories: Collection;
  modifiers: Collection;
  turn: number = 0;

  constructor(settings: GameSettings) {
    this.settings = settings;
    this.categories = this.processRawPromptData(rawData.categories);
    this.modifiers = this.processRawPromptData(rawData.modifiers);
  }

  updateSettings(newSettings: GameSettings) {
    const messages: SystemMessage[] = [];
    const oldSettings = this.settings;

    const repeatTurnedOn =
      oldSettings.repeat === false && newSettings.repeat === true;
    const hasPlayed =
      !!this.categories.played.size || !!this.modifiers.played.size;
    if (repeatTurnedOn) {
      this.reset();
    }

    if (repeatTurnedOn && hasPlayed) {
      messages.push("history.cleared");
    }

    this.settings = newSettings;
    return messages;
  }

  nextTurn() {
    this.turn += 1;
    const { repeat, modifiers, modifierProbability } = this.settings || {};
    const category = this.getPrompt(this.categories, repeat);

    const modifierRequired = Math.random() < modifierProbability / 100;
    if (!modifiers || !modifierRequired) {
      return { category, slug: `${this.turn}-${category.key}` };
    }

    const modifier = this.getPrompt(this.modifiers, repeat, category.excluded);
    return {
      category,
      modifier,
      slug: `${this.turn}-${category.key}-${modifier.key}`,
    };
  }

  getModifier(category: Prompt) {
    return this.getPrompt(
      this.modifiers,
      this.settings.repeat,
      category.excluded,
    );
  }

  private getPrompt(
    list: Collection,
    repeat: boolean,
    excluded: string[] = [],
  ) {
    const { prompts: items, played } = list;

    if (items.length === played.size) {
      played.clear();
    }

    let prompt;
    while (!prompt) {
      const index = getRandomNumberInRange(0, items.length - 1);
      const promptCandidate = items[index];

      // check if valid prompt
      const alreadyPlayed = played.has(promptCandidate.key);
      if (alreadyPlayed && !repeat) {
        continue;
      }
      if (excluded.includes(promptCandidate.key)) {
        continue;
      }

      prompt = promptCandidate;
      played.add(prompt.key);
    }

    return prompt;
  }

  private reset() {
    this.categories.played.clear();
    this.modifiers.played.clear();
    this.turn = 0;
  }

  private processRawPromptData(
    rawCollection: Record<
      string,
      { name: string; description?: string | string[]; excluded?: string[] }
    >,
  ) {
    const items = Object.entries(rawCollection).map(([key, prompt]) => {
      let description: string | undefined;
      if (prompt.description instanceof Array) {
        description = prompt.description.join("");
      } else {
        description = prompt.description;
      }
      return { key, description, name: prompt.name, excluded: prompt.excluded };
    });
    return { prompts: items, played: new Set<PromptKey>() };
  }
}
