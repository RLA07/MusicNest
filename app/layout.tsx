import type { Metadata } from "next";
import { Poppins, Righteous } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { PlayerProvider } from "@/components/PlayerProvider";
import PlayerShell from "@/components/PlayerShell";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

const righteous = Righteous({
  variable: "--font-righteous",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Music Nest",
  description: "Aplikasi streaming musik pribadi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${poppins.variable} ${righteous.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PlayerProvider>
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 min-w-0 overflow-y-auto p-6 pb-28">{children}</main>
          </div>
          <PlayerShell />
        </PlayerProvider>
      </body>
    </html>
  );
}