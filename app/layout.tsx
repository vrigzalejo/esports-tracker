import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import AlphaBanner from "@/components/ui/AlphaBanner";
import { GamesProvider } from "@/contexts/GamesContext";
import { DataProvider } from "@/contexts/DataContext";
import CacheStatus from "@/components/debug/CacheStatus";

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
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' }
    ],
    apple: [
      { url: '/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' }
    ],
    other: [
      { rel: 'icon', url: '/icon.svg', sizes: '512x512', type: 'image/svg+xml' }
    ]
  },
  openGraph: {
    title: 'EsportsTracker',
    description: 'Your ultimate destination for esports matches, tournaments, teams, and statistics',
    type: 'website',
    images: [
      {
        url: '/icon.svg',
        width: 512,
        height: 512,
        alt: 'EsportsTracker Logo'
      }
    ]
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <DataProvider>
          <GamesProvider>
            <AlphaBanner />
            <div className="flex-1">
              {children}
            </div>
            <Footer />
            {process.env.NODE_ENV === 'development' && <CacheStatus />}
          </GamesProvider>
        </DataProvider>
      </body>
    </html>
  );
}
