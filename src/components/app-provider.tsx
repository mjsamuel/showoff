"use client";

import { GameSettings } from "@/lib/game-engine";
import { createContext, useCallback, useEffect, useState } from "react";

const SETTINGS_STORAGE_KEY = "settings";
export const DEFAULT_GAME_SETTINGS: GameSettings = {
  repeat: false,
  modifiers: true,
  modifierProbability: 25,
};

type AppState =
  | { status: "loading" }
  | { status: "ready"; settings: GameSettings };
export const AppContext = createContext<{
  state: AppState;
  setSettings: (newSettings: GameSettings) => void;
}>({
  state: { status: "loading" },
  setSettings: () => {},
});

export default function App({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({ status: "loading" });

  const setSettings = useCallback(
    (newSettings: GameSettings) => {
      if (state.status !== "ready") return;
      setState({ status: "ready", settings: newSettings });
    },
    [state.status],
  );

  // settings need to be loaded from local storage after server-side rendering
  // to avoid hydration errors
  useEffect(() => {
    let s = DEFAULT_GAME_SETTINGS;
    const storedSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (storedSettings) {
      try {
        s = JSON.parse(storedSettings);
      } catch (error) {
        console.error("Error parsing settings from local storage", error);
      }
    }
    setTimeout(() => setState({ status: "ready", settings: s }), 500);
  }, []);

  // save settings to local storage when they change
  useEffect(() => {
    if (state.status !== "ready") return;
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(state.settings),
    );
  }, [state]);

  return (
    <AppContext.Provider value={{ state, setSettings }}>
      {children}
    </AppContext.Provider>
  );
}
