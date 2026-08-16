import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import MobileNav from "@/components/MobileNav";
import { PlayerProvider } from "@/components/PlayerProvider";
import PlayerShell from "@/components/PlayerShell";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Music Nest",
  description: "Aplikasi streaming musik pribadi",
  icons: { icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎵</text></svg>" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className={`${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent focus:text-sm focus:font-semibold">
          Lewati ke konten
        </a>
        <PlayerProvider>
          <div className="flex flex-1">
            <Sidebar />
            <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
              <MobileHeader />
              <main id="main" className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 pb-44 sm:pb-28">
                <div className="content-container">{children}</div>
              </main>
            </div>
          </div>
          <MobileNav />
          <PlayerShell />
        </PlayerProvider>
      </body>
    </html>
  );
}
