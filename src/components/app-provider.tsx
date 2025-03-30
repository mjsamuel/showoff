"use client";

import { createContext, useState } from "react";

export type GameSettings = {
  repeat: boolean;
  modifiers: boolean;
  modifierProbability: number;
};
type AppContextProps = {
  settings: GameSettings;
  setSettings: (settings: GameSettings) => void;
};
export const AppContext = createContext<AppContextProps | null>(null);

export default function App({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState({} as GameSettings);
  return (
    <AppContext.Provider value={{ settings, setSettings }}>
      {children}
    </AppContext.Provider>
  );
}
