import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: 'EsportsTracker - Live Matches, Tournaments & Stats',
  description: 'Your ultimate destination for esports matches, tournaments, teams, and statistics',
  keywords: ['esports', 'gaming', 'tournaments', 'matches', 'teams', 'statistics'],
  authors: [{ name: 'EsportsTracker' }],
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'EsportsTracker',
    description: 'Your ultimate destination for esports matches, tournaments, teams, and statistics',
    type: 'website',
  },
}

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
        {children}
      </body>
    </html>
  );
}
