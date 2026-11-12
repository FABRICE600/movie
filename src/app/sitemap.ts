import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://cineverse.example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Primary navigation pages (single-page app views)
  const views = [
    "home",
    "discover",
    "movies",
    "tv",
    "people",
    "genres",
    "trending",
    "top-rated",
    "upcoming",
    "now-playing",
    "collections",
    "providers",
    "trailers",
    "franchises",
    "box-office",
    "awards",
    "calendar",
    "compare",
    "ai-assistant",
    "trivia",
    "year-review",
    "community",
    "about",
    "privacy",
    "terms",
    "help",
    "faq",
    "contact",
  ];

  return views.map((v) => ({
    url: `${BASE_URL}/?view=${v}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: v === "home" ? 1.0 : v === "discover" || v === "movies" || v === "tv" ? 0.9 : 0.7,
  }));
}
