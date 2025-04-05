"use client";

import { GameSettings } from "@/lib/game-engine";
import { createContext, useState } from "react";

type AppContextProps = {
  settings: GameSettings;
  setSettings: (settings: GameSettings) => void;
};
export const AppContext = createContext<AppContextProps>({} as AppContextProps);

export default function App({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState({
    repeat: false,
    modifiers: false,
    modifierProbability: 25,
  });

  return (
    <AppContext.Provider value={{ settings, setSettings }}>
      {children}
    </AppContext.Provider>
  );
}
