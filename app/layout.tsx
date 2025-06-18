import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import AlphaBanner from "@/components/ui/AlphaBanner";
import CookieNotification from "@/components/ui/CookieNotification";
import { GamesProvider } from "@/contexts/GamesContext";
import { DataProvider } from "@/contexts/DataContext";
import CacheStatus from "@/components/debug/CacheStatus";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

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
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover'
  },
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
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'theme-color': '#1f2937'
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gray-900 text-white`}
      >
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        <DataProvider>
          <GamesProvider>
            <AlphaBanner />
            <div className="flex-1 flex flex-col">
              {children}
            </div>
            <Footer />
            <CookieNotification />
            {process.env.NODE_ENV === 'development' && <CacheStatus />}
          </GamesProvider>
        </DataProvider>
      </body>
    </html>
  );
}
