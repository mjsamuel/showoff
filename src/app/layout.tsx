import "./globals.css";
import type { Metadata, Viewport } from "next";

import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Toaster } from "@/components/ui/sonner";

import { Analytics } from "@vercel/analytics/react";
import App from "@/components/app-provider";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Showoff",
  description:
    "A game created for cardists to test their skill and knowledge in cardistry!",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAFA" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Analytics />
      <Head>
        <meta name="theme-color" content="#319197"></meta>
      </Head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider defaultOpen>
            <App>
              <SidebarTrigger className="fixed top-4 left-2 z-50 size-9" />
              <AppSidebar />
              <main className="w-full">{children}</main>
            </App>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
