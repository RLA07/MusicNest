import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { PlayerProvider } from "@/components/PlayerProvider";
import PlayerShell from "@/components/PlayerShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Music Nest",
  description: "Aplikasi streaming musik pribadi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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