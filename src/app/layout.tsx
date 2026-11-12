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
  title: "CineVerse — Discover Movies & TV",
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
  ],
  authors: [{ name: "CineVerse Team" }],
  openGraph: {
    title: "CineVerse — Discover Movies & TV",
    description: "A modern movie and TV discovery platform.",
    siteName: "CineVerse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CineVerse",
    description: "A modern movie and TV discovery platform.",
  },
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
