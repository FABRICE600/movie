"use client";

import { useQuery } from "@tanstack/react-query";
import { tmdb } from "@/lib/tmdb";
import { MovieGrid, MovieGridSkeleton } from "@/components/site/movie-card";
import { GENRES, MOVIES, TV_SHOWS, PROVIDERS, COLLECTIONS } from "@/lib/mock-data";
import { useAppStore } from "@/store/app-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Star, Calendar, Play, Tag, Layers, Tv } from "lucide-react";

export function ListingView({ kind }: { kind: "trending" | "top-rated" | "upcoming" | "now-playing" | "movies" | "tv" }) {
  const navigate = useAppStore((s) => s.navigate);
  const titles: Record<typeof kind, string> = {
    trending: "Trending now",
    "top-rated": "Top rated",
    upcoming: "Upcoming releases",
    "now-playing": "Now playing",
    movies: "All movies",
    tv: "All TV shows",
  };
  const icons = {
    trending: Flame,
    "top-rated": Star,
    upcoming: Calendar,
    "now-playing": Play,
    movies: Tag,
    tv: Tv,
  };
  const Icon = icons[kind];

  const { data, isLoading } = useQuery({
    queryKey: ["listing", kind],
    queryFn: async () => {
      switch (kind) {
        case "trending": return tmdb.getTrending("week", "all");
        case "top-rated": return tmdb.getTopRated("MOVIE");
        case "upcoming": return tmdb.getUpcoming();
        case "now-playing": return tmdb.getNowPlaying();
        case "movies": return MOVIES;
        case "tv": return TV_SHOWS;
      }
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/15 text-primary flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{titles[kind]}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{data?.length ?? 0} titles</p>
        </div>
      </div>
      {isLoading ? <MovieGridSkeleton count={12} /> : data && data.length ? <MovieGrid items={data} /> : (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">No titles found.</div>
      )}
    </div>
  );
}

export function GenresView() {
  const navigate = useAppStore((s) => s.navigate);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Browse by genre</h1>
        <p className="text-sm text-muted-foreground mt-1">Find your next favorite by mood and category.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {GENRES.map((g) => {
          const count = MOVIES.filter((m) => m.genres.includes(g.id)).length + TV_SHOWS.filter((m) => m.genres.includes(g.id)).length;
          return (
            <button
              key={g.id}
              onClick={() => navigate("discover", { genreId: g.id })}
              className="group relative aspect-video rounded-lg overflow-hidden border border-border bg-card p-4 text-left hover:border-primary/50 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex flex-col h-full justify-between">
                <Layers className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-bold">{g.name}</p>
                  <p className="text-xs text-muted-foreground">{count} titles</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ProvidersView() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Streaming providers</h1>
        <p className="text-sm text-muted-foreground mt-1">Discover where to watch across supported providers.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {PROVIDERS.map((p) => (
          <Card key={p.id} className="bg-card border-border overflow-hidden">
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className="h-12 w-12 rounded flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: p.color }}
              >
                {p.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm">{p.name}</p>
                <Badge variant="secondary" className="text-[10px]">Streaming</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Real-time availability requires the Watchmode API. This is illustrative demo data.
      </p>
    </div>
  );
}

export function CollectionsView() {
  const navigate = useAppStore((s) => s.navigate);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Editor collections</h1>
        <p className="text-sm text-muted-foreground mt-1">Curated lists from the CineVerse team.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {COLLECTIONS.map((c) => (
          <button
            key={c.id}
            onClick={() => navigate("movie", { id: c.items[0] })}
            className="group relative aspect-video rounded-lg overflow-hidden border border-border"
          >
            { }
            <img src={c.coverUrl} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-left text-white">
              <Badge className="mb-1 bg-primary text-primary-foreground">{c.items.length} titles</Badge>
              <h3 className="text-xl font-bold">{c.name}</h3>
              <p className="text-xs text-white/80 line-clamp-2">{c.description}</p>
              <p className="text-[10px] text-white/60 mt-1">Curated by {c.curator}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function TrailersView() {
  const navigate = useAppStore((s) => s.navigate);
  // Sort by popularity and prefer titles with real YouTube trailers (not the placeholder).
  const items = [...MOVIES, ...TV_SHOWS]
    .filter((m) => m.trailerYoutubeId)
    .sort((a, b) => {
      // Items without placeholder rank higher
      const aReal = a.trailerYoutubeId !== "dQw4w9WgXcQ" ? 1 : 0;
      const bReal = b.trailerYoutubeId !== "dQw4w9WgXcQ" ? 1 : 0;
      if (aReal !== bReal) return bReal - aReal;
      return b.popularity - a.popularity;
    })
    .slice(0, 18);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
          <Play className="h-6 w-6 text-primary" /> Trailers
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Watch official trailers from across the catalog.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.mediaType === "TV" ? "tv-details" : "movie", { id: item.id })}
            className="group text-left rounded-lg overflow-hidden border border-border bg-card"
          >
            <div className="relative aspect-video bg-muted">
              { }
              <img src={item.backdropUrl} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                </div>
              </div>
            </div>
            <div className="p-3">
              <p className="font-medium text-sm line-clamp-1">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.year} · {item.genreNames.slice(0, 2).join(", ")}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function StaticPage({ kind }: { kind: "about" | "privacy" | "terms" }) {
  const content = {
    about: {
      title: "About CineVerse",
      body: "CineVerse is a modern movie and TV discovery platform built to help audiences around the world find stories worth their time. From Hollywood blockbusters to Rwandan cinema, Korean dramas to European arthouse — we celebrate the full spectrum of moving images. This is a demo platform showcasing a full-stack Next.js + Prisma application.",
    },
    privacy: {
      title: "Privacy Policy",
      body: "Your privacy matters. CineVerse collects only the information necessary to provide your watchlist, ratings, reviews, and personalized recommendations. We never sell your data. You can export or delete your data at any time from your profile. This is a demo policy — production deployments should provide a full, reviewed privacy policy.",
    },
    terms: {
      title: "Terms & Conditions",
      body: "By using CineVerse you agree to use the platform lawfully and respectfully. Reviews must follow our community guidelines: no hate speech, no spam, no spoilers without warning. Account holders are responsible for their activity. Demo data is illustrative only. Real deployments should provide complete terms reviewed by counsel.",
    },
  }[kind];
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-4">
      <h1 className="text-3xl font-black tracking-tight">{content.title}</h1>
      <p className="text-muted-foreground leading-relaxed">{content.body}</p>
    </div>
  );
}
