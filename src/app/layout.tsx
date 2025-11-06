import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { AppKitProvider } from "@/components/AppKitProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coin Flip Betting",
  description: "Bet crypto on heads or tails in a fair coin flip game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppKitProvider>
          <header className="w-full border-b border-gray-200 bg-white">
            <nav className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4 text-sm">
              <Link href="/play" className="text-gray-700 hover:text-gray-900">
                Play
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                href="/leaderboard"
                className="text-gray-700 hover:text-gray-900"
              >
                Leaderboard
              </Link>
            </nav>
          </header>
          {children}
        </AppKitProvider>
      </body>
    </html>
  );
}
