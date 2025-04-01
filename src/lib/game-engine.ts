export type GameSettings = {
  repeat: boolean;
  modifiers: boolean;
  modifierProbability: number;
};

class GameEngine {
  settings: GameSettings;

  constructor(settings: GameSettings) {
    this.settings = settings;
  }

  updateSettings(settings: GameSettings) {
    this.settings = settings;
  }
}
