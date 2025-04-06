"use client";

import { GameSettings } from "@/lib/game-engine";
import { createContext, useEffect, useState } from "react";

const DEFAULT_GAME_SETTINGS: GameSettings = {
  repeat: false,
  modifiers: false,
  modifierProbability: 25,
};
export const AppContext = createContext({
  settings: DEFAULT_GAME_SETTINGS,
  setSettings: (_: GameSettings) => {},
});

export default function App({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_GAME_SETTINGS);

  // settings need to be loaded from local storage after server-side rendering
  // to avoid hydration errors
  useEffect(() => {
    const storedSettings = window.localStorage.getItem("settings");
    setSettings(
      storedSettings !== null
        ? JSON.parse(storedSettings)
        : DEFAULT_GAME_SETTINGS,
    );
  }, []);

  // save settings to local storage when they change
  useEffect(() => {
    window.localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);

  return (
    <AppContext.Provider value={{ settings, setSettings }}>
      {children}
    </AppContext.Provider>
  );
}
