"use client";

import { Film, Github, Twitter, Instagram, Youtube } from "lucide-react";
import { useAppStore, type ViewName } from "@/store/app-store";

const FOOTER_LINKS: { label: string; view?: ViewName; href?: string }[][] = [
  [
    { label: "About us", view: "about" },
    { label: "Discover", view: "discover" },
    { label: "Trending", view: "trending" },
    { label: "Top Rated", view: "top-rated" },
    { label: "Upcoming", view: "upcoming" },
  ],
  [
    { label: "Genres", view: "genres" },
    { label: "Collections", view: "collections" },
    { label: "Streaming Providers", view: "providers" },
    { label: "Trailers", view: "trailers" },
    { label: "People", view: "people" },
  ],
  [
    { label: "Privacy Policy", view: "privacy" },
    { label: "Terms & Conditions", view: "terms" },
    { label: "Help Center", href: "#" },
    { label: "Contact us", href: "#" },
    { label: "FAQ", href: "#" },
  ],
];

export function Footer() {
  const navigate = useAppStore((s) => s.navigate);

  return (
    <footer className="mt-auto border-t border-border bg-card/50 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <button onClick={() => navigate("home")} className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
                <Film className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-black">
                Cine<span className="text-primary">Verse</span>
              </span>
            </button>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your modern home for discovering movies and TV shows from around the world. Powered by TMDB-style data with personalized watchlists, reviews, and a vibrant community.
            </p>
            <div className="flex gap-2 mt-4">
              {[Twitter, Instagram, Youtube, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {FOOTER_LINKS.map((group, gi) => (
            <div key={gi}>
              <h4 className="text-sm font-semibold mb-3">Explore</h4>
              <ul className="space-y-2">
                {group.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => link.view && navigate(link.view)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} CineVerse. Demo data. Not affiliated with TMDB, IMDb, or any streaming service.</p>
          <p>Built with Next.js, Prisma, and Tailwind CSS.</p>
        </div>
      </div>
    </footer>
  );
}
