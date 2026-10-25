import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Board } from "@/components/board";
import { GameProvider } from "@/components/game-provider";
import { ThemeSync } from "@/components/theme-sync";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <>
      <ThemeSync />
      <SidebarProvider defaultOpen>
        <GameProvider>
          <SidebarTrigger className="fixed top-4 left-2 z-50 size-9" />
          <AppSidebar />
          <main className="w-full">
            <Board />
          </main>
        </GameProvider>
      </SidebarProvider>
      <Toaster />
    </>
  );
}
