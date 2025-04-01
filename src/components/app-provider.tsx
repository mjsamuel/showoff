"use client";

import { GameSettings } from "@/lib/game-engine";
import { createContext, useState } from "react";

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
