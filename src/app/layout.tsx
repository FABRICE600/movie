import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CineVerse — Discover Movies & TV",
    template: "%s · CineVerse",
  },
  description:
    "CineVerse is a modern movie and TV discovery platform with real-time data, personalized recommendations, watchlists, reviews, and a vibrant community.",
  keywords: [
    "movies",
    "tv shows",
    "streaming",
    "trailers",
    "reviews",
    "watchlist",
    "tmdb",
    "cinema",
    "CineVerse",
    "African cinema",
    "Nollywood",
    "Korean drama",
    "anime",
  ],
  authors: [{ name: "CineVerse Team" }],
  manifest: "/manifest.json",
  applicationName: "CineVerse",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CineVerse",
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  openGraph: {
    title: "CineVerse — Discover Movies & TV",
    description: "A modern movie and TV discovery platform.",
    siteName: "CineVerse",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/logo.svg",
        width: 512,
        height: 512,
        alt: "CineVerse",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CineVerse",
    description: "A modern movie and TV discovery platform.",
    images: ["/logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  category: "entertainment",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${inter.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <Providers>{children}</Providers>
        <Toaster position="bottom-right" theme="dark" richColors closeButton />
      </body>
    </html>
  );
}
