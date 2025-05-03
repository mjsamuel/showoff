"use client";

import { GameSettings } from "@/lib/game-engine";
import { createContext, useEffect, useState } from "react";

const SETTINGS_STORAGE_KEY = "settings";
const DEFAULT_GAME_SETTINGS: GameSettings = {
  repeat: false,
  modifiers: true,
  modifierProbability: 25,
};

type SettingsState =
  | { status: "loading" }
  | { status: "ready"; settings: GameSettings };
export const SettingsContext = createContext<
  [SettingsState, (newSettings: GameSettings) => void]
>([{ status: "loading" }, () => {}]);

export default function SettingsProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [state, setState] = useState<SettingsState>({ status: "loading" });
  const setSettings = (newSettings: GameSettings) => {
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(newSettings),
    );
    setState({ status: "ready", settings: newSettings });
  };

  // settings need to be loaded from local storage after server-side rendering
  // to avoid hydration errors
  useEffect(() => {
    let settings = DEFAULT_GAME_SETTINGS;
    const storedSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (storedSettings) {
      try {
        settings = JSON.parse(storedSettings);
      } catch (error) {
        console.error("Error parsing settings from local storage", error);
      }
    }
    // Simulate a delay to mimic loading state
    setTimeout(() => setState({ status: "ready", settings }), 500);
  }, []);

  return (
    <SettingsContext.Provider value={[state, setSettings]}>
      {children}
    </SettingsContext.Provider>
  );
}
